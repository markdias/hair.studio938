import { google } from 'googleapis';
import { startOfDay, endOfDay, addMinutes, format, parseISO, isWithinInterval } from 'date-fns';
import { supabase } from './_lib/supabase.js';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { date, stylist, service, duration: durationMinutes } = req.query;
    const duration = parseInt(durationMinutes) || 60;

    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    // Check opening hours first
    let openingSlots = [];
    try {
        const { data: settingsData, error: settingsError } = await supabase
            .from('site_settings')
            .select('opening_hours')
            .single();

        if (!settingsError && settingsData?.opening_hours) {
            const selectedDate = parseISO(date);
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayName = dayNames[selectedDate.getDay()];

            // Parse opening hours matching the AdminDashboard format
            const parseOpeningHours = (text) => {
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const hours = Array.from({ length: 13 }, (_, i) => i + 8);
                const selectedSlots = {};

                // Initialize all days as closed
                days.forEach(day => {
                    selectedSlots[day] = new Array(13).fill(false);
                });

                if (!text || text.toLowerCase() === 'closed') return selectedSlots;

                // Parse text - Expected format: "Mon-Fri: 9 AM - 6 PM, Sat: 10 AM - 4 PM"
                const parts = text.split(',').map(p => p.trim());

                parts.forEach(part => {
                    const match = part.match(/([A-Za-z\-]+):\s*(.+)/);
                    if (!match) return;

                    const [, dayPart, timePart] = match;
                    const timeRanges = timePart.split(',').map(t => t.trim());

                    // Parse day range
                    let targetDays = [];
                    if (dayPart.includes('-')) {
                        const [start, end] = dayPart.split('-').map(d => d.trim());
                        const startIdx = days.indexOf(start);
                        const endIdx = days.indexOf(end);
                        if (startIdx !== -1 && endIdx !== -1) {
                            for (let i = startIdx; i <= endIdx; i++) {
                                targetDays.push(days[i]);
                            }
                        }
                    } else {
                        const day = days.find(d => dayPart.includes(d));
                        if (day) targetDays.push(day);
                    }

                    // Parse time ranges
                    timeRanges.forEach(timeRange => {
                        const timeMatch = timeRange.match(/(\d+)\s*(AM|PM)\s*-\s*(\d+)\s*(AM|PM)/i);
                        if (!timeMatch) return;

                        let [, startHour, startPeriod, endHour, endPeriod] = timeMatch;
                        startHour = parseInt(startHour);
                        endHour = parseInt(endHour);

                        // Convert to 24-hour
                        if (startPeriod.toUpperCase() === 'PM' && startHour !== 12) startHour += 12;
                        if (startPeriod.toUpperCase() === 'AM' && startHour === 12) startHour = 0;
                        if (endPeriod.toUpperCase() === 'PM' && endHour !== 12) endHour += 12;
                        if (endPeriod.toUpperCase() === 'AM' && endHour === 12) endHour = 0;

                        // Mark slots as selected
                        targetDays.forEach(day => {
                            hours.forEach((hour, idx) => {
                                if (hour >= startHour && hour < endHour) {
                                    selectedSlots[day][idx] = true;
                                }
                            });
                        });
                    });
                });

                return selectedSlots;
            };

            const parsedHours = parseOpeningHours(settingsData.opening_hours);
            openingSlots = parsedHours[dayName];

            // If salon is closed on this day (no slots or all slots are false)
            if (!openingSlots || !openingSlots.some(s => s)) {
                return res.status(200).json({ slots: [], closed: true });
            }
        }
    } catch (err) {
        console.warn('Could not fetch opening hours:', err.message);
    }

    // Check for credentials
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const defaultCalendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!privateKey || !clientEmail) {
        console.warn('Google Calendar credentials not configured. Returning dummy data.');
        const dummySlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        return res.status(200).json({
            slots: dummySlots,
            warning: 'Config required.'
        });
    }

    try {
        const cleanKey = (key) => {
            if (!key) return null;
            let cleaned = key.trim();
            if (!cleaned.startsWith('-')) {
                try {
                    const decoded = Buffer.from(cleaned, 'base64').toString('utf8');
                    if (decoded.includes('BEGIN PRIVATE KEY')) cleaned = decoded;
                } catch (e) { }
            }
            cleaned = cleaned.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
            if (cleaned.includes('BEGIN PRIVATE KEY') && !cleaned.includes('\n')) {
                cleaned = cleaned.replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n').replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
            }
            return cleaned.trim();
        };

        const auth = new google.auth.JWT(clientEmail, null, cleanKey(privateKey), SCOPES);
        const calendar = google.calendar({ version: 'v3', auth });

        // Identify which stylists/calendars to check
        let stylistsToCheck = [];

        if (stylist) {
            // Specific stylist
            const { data } = await supabase.from('stylist_calendars').select('stylist_name, calendar_id').eq('stylist_name', stylist).single();
            if (data) stylistsToCheck.push(data);
        } else if (service) {
            // Any professional who can do this service
            const { data } = await supabase.from('stylist_calendars').select('stylist_name, calendar_id').contains('provided_services', [service]);
            stylistsToCheck = data || [];
        } else {
            // Fallback to default calendar if no stylist or service specified
            stylistsToCheck.push({ stylist_name: 'Default', calendar_id: defaultCalendarId });
        }

        if (stylistsToCheck.length === 0) {
            return res.status(200).json({ slots: [], message: 'No professionals available for this service.' });
        }

        // Fetch availability from all relevant calendars
        const timeMin = startOfDay(parseISO(date)).toISOString();
        const timeMax = endOfDay(parseISO(date)).toISOString();

        const allBusySlots = await Promise.all(stylistsToCheck.map(async (st) => {
            if (!st.calendar_id) return { stylist: st.stylist_name, busy: [] };
            try {
                const response = await calendar.events.list({
                    calendarId: st.calendar_id,
                    timeMin,
                    timeMax,
                    singleEvents: true,
                });
                return {
                    stylist: st.stylist_name,
                    busy: response.data.items.map(event => ({
                        start: parseISO(event.start.dateTime || event.start.date),
                        end: parseISO(event.end.dateTime || event.end.date)
                    }))
                };
            } catch (err) {
                console.error(`Error fetching calendar for ${st.stylist_name}:`, err.message);
                return { stylist: st.stylist_name, busy: [] };
            }
        }));

        // Generate and evaluate slots
        const availableSlots = [];
        const baseDate = startOfDay(parseISO(date));

        // Check every 30 minutes for potential starts (to offer more flexibility)
        // Opening hours assumed 8:00 to 21:00 (based on openingSlots indexing 8AM-8PM + 1)
        for (let hour = 8; hour < 21; hour++) {
            for (let mins of [0, 30]) {
                const slotStart = addMinutes(baseDate, hour * 60 + mins);
                const slotEnd = addMinutes(slotStart, duration);

                // Check if the entire slot is within opening hours
                const dayIndex = hour - 8;
                // Simple check for opening hours (assuming full hour blocks in openingSlots)
                // If it starts at :30, we check both this hour and the next if necessary
                if (!openingSlots[dayIndex]) continue;
                if (mins === 30 && hour < 20 && !openingSlots[dayIndex + 1]) continue;

                // Check if AT LEAST ONE stylist is free for the entire duration
                const anyoneFree = allBusySlots.some(st => {
                    const isBusy = st.busy.some(busy => {
                        // Check for overlap: max(start) < min(end)
                        const overlapStart = slotStart > busy.start ? slotStart : busy.start;
                        const overlapEnd = slotEnd < busy.end ? slotEnd : busy.end;
                        return overlapStart < overlapEnd;
                    });
                    return !isBusy;
                });

                if (anyoneFree) {
                    availableSlots.push(format(slotStart, 'HH:mm'));
                }
            }
        }

        // Return unique, sorted slots
        const uniqueSlots = [...new Set(availableSlots)].sort();
        return res.status(200).json({ slots: uniqueSlots });

    } catch (error) {
        console.error('Availability API Error:', error);
        return res.status(500).json({ error: 'Failed to fetch availability', details: error.message });
    }
}
