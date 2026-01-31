import { google } from 'googleapis';
import { startOfDay, endOfDay, addMinutes, format, parseISO, isWithinInterval } from 'date-fns';
import { supabase } from './_lib/supabase.js';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { date, stylist } = req.query;

    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    // Check opening hours first
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
            const slots = parsedHours[dayName];

            // If salon is closed on this day (no slots or all slots are false), return empty slots
            if (!slots || !slots.some(s => s)) {
                return res.status(200).json({ slots: [], closed: true });
            }
        }
    } catch (err) {
        console.warn('Could not fetch opening hours:', err.message);
        // Continue anyway if opening hours check fails
    }

    // Check for credentials
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let calendarId = process.env.GOOGLE_CALENDAR_ID;

    // Fetch stylist-specific calendar if provided
    if (stylist) {
        try {
            const { data, error } = await supabase
                .from('stylist_calendars')
                .select('calendar_id')
                .eq('stylist_name', stylist)
                .single();

            if (data?.calendar_id) {
                calendarId = data.calendar_id;
                console.log(`Using specific calendar for ${stylist}: ${calendarId}`);
            }
        } catch (err) {
            console.warn(`Could not fetch calendar for ${stylist}, falling back to default:`, err.message);
        }
    }

    if (!privateKey || !clientEmail || !calendarId) {
        // Return dummy data if credentials are not configured yet, 
        // but include a warning in the response
        console.warn('Google Calendar credentials not configured. Returning dummy data.');
        const dummySlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        return res.status(200).json({
            slots: dummySlots,
            warning: 'Config required. Visit Vercel settings to add GOOGLE_PRIVATE_KEY, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_CALENDAR_ID.'
        });
    }

    try {
        const cleanKey = (key) => {
            if (!key) return null;
            let cleaned = key.trim();

            // 1. Handle Base64 encoding (very robust for Vercel)
            if (!cleaned.startsWith('-')) {
                try {
                    const decoded = Buffer.from(cleaned, 'base64').toString('utf8');
                    if (decoded.includes('BEGIN PRIVATE KEY')) {
                        console.log('Decoded Base64 key successfully');
                        cleaned = decoded;
                    }
                } catch (e) { /* not base64 */ }
            }

            // 2. Remove any surrounding quotes
            cleaned = cleaned.replace(/^["']|["']$/g, '');

            // 3. Handle literal \n characters
            cleaned = cleaned.replace(/\\n/g, '\n');

            // 4. Ensure PEM structure (add newlines if missing in one-liner)
            if (cleaned.includes('BEGIN PRIVATE KEY') && !cleaned.includes('\n')) {
                cleaned = cleaned
                    .replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
                    .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
            }

            return cleaned.trim();
        };

        const cleanedKey = cleanKey(privateKey);
        console.log('Diagnostic - Key info:', {
            length: cleanedKey?.length,
            startsWithHeader: cleanedKey?.startsWith('-----BEGIN'),
            endsWithHeader: cleanedKey?.endsWith('KEY-----'),
            lineCount: cleanedKey?.split('\n').length
        });

        const auth = new google.auth.JWT(
            clientEmail,
            null,
            cleanedKey,
            SCOPES
        );

        const calendar = google.calendar({ version: 'v3', auth });

        // Define search interval for the given date
        const timeMin = startOfDay(parseISO(date)).toISOString();
        const timeMax = endOfDay(parseISO(date)).toISOString();

        const response = await calendar.events.list({
            calendarId,
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const busySlots = response.data.items.map(event => ({
            start: parseISO(event.start.dateTime || event.start.date),
            end: parseISO(event.end.dateTime || event.end.date)
        }));

        // Generate possible slots (Opening hours: 9:00 - 18:00)
        const allSlots = [];
        let current = addMinutes(startOfDay(parseISO(date)), 9 * 60); // 9:00 AM
        const dayEnd = addMinutes(startOfDay(parseISO(date)), 18 * 60); // 6:00 PM

        while (current < dayEnd) {
            const slotTime = current;
            const isBusy = busySlots.some(busy =>
                isWithinInterval(slotTime, { start: busy.start, end: addMinutes(busy.end, -1) }) ||
                isWithinInterval(addMinutes(slotTime, 59), { start: addMinutes(busy.start, 1), end: busy.end })
            );

            if (!isBusy) {
                allSlots.push(format(slotTime, 'HH:mm'));
            }
            current = addMinutes(current, 60); // 1 hour slots
        }

        return res.status(200).json({ slots: allSlots });
    } catch (error) {
        console.error('Calendar API Error:', error);
        return res.status(500).json({ error: 'Failed to fetch availability', details: error.message });
    }
}
