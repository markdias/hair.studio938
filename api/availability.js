import { google } from 'googleapis';
import { startOfDay, endOfDay, addMinutes, format, parseISO, isWithinInterval } from 'date-fns';
import { supabase } from './_lib/supabase.js';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { date, professional, service, duration: durationMinutes } = req.query;
    const duration = parseInt(durationMinutes) || 60;

    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    // Check opening hours first
    const hoursCount = 13; // 8 AM to 8 PM
    let openingSlots = new Array(hoursCount).fill(true); // Default to open to avoid "no slots" bug

    // Sensible default fallback (9 AM - 6 PM)
    const fallbackSlots = new Array(hoursCount).fill(false);
    for (let i = 1; i <= 10; i++) fallbackSlots[i] = true;

    try {
        const { data: settingsData, error: settingsError } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'opening_hours')
            .single();

        const openingHoursText = settingsData?.value;

        if (!settingsError && openingHoursText) {
            const selectedDate = parseISO(date);
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayName = dayNames[selectedDate.getDay()];

            const parseOpeningHours = (text) => {
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const selectedSlots = {};
                days.forEach(day => { selectedSlots[day] = new Array(13).fill(false); });

                if (!text || text.toLowerCase() === 'closed') return selectedSlots;

                const parts = text.split(',').map(p => p.trim());
                parts.forEach(part => {
                    const match = part.match(/([A-Za-z\-]+):\s*(.+)/);
                    if (!match) return;

                    const [, dayPart, timePart] = match;
                    let targetDays = [];
                    if (dayPart.includes('-')) {
                        const [start, end] = dayPart.split('-').map(d => d.trim());
                        const startIdx = days.indexOf(start);
                        const endIdx = days.indexOf(end);
                        if (startIdx !== -1 && endIdx !== -1) {
                            for (let i = startIdx; i <= endIdx; i++) targetDays.push(days[i]);
                        }
                    } else {
                        const day = days.find(d => dayPart.includes(d));
                        if (day) targetDays.push(day);
                    }

                    timePart.split(',').forEach(range => {
                        const timeMatch = range.match(/(\d+)\s*(AM|PM)\s*-\s*(\d+)\s*(AM|PM)/i);
                        if (!timeMatch) return;
                        let [, sh, sp, eh, ep] = timeMatch;
                        let startH = parseInt(sh);
                        let endH = parseInt(eh);
                        if (sp.toUpperCase() === 'PM' && startH !== 12) startH += 12;
                        if (sp.toUpperCase() === 'AM' && startH === 12) startH = 0;
                        if (ep.toUpperCase() === 'PM' && endH !== 12) endH += 12;
                        if (ep.toUpperCase() === 'AM' && endH === 12) endH = 0;

                        targetDays.forEach(day => {
                            for (let h = 8; h < 21; h++) {
                                if (h >= startH && h < endH) selectedSlots[day][h - 8] = true;
                            }
                        });
                    });
                });
                return selectedSlots;
            };

            const parsedHours = parseOpeningHours(openingHoursText);
            const slotsForDay = parsedHours[dayName];

            if (slotsForDay && slotsForDay.some(s => s)) {
                openingSlots = slotsForDay;
            } else if (openingHoursText.toLowerCase() === 'closed') {
                openingSlots = new Array(13).fill(false);
            } else {
                console.warn('Parsing failed for', dayName, '- using fallback');
                openingSlots = fallbackSlots;
            }
        }
    } catch (err) {
        console.warn('Opening hours check failed:', err.message);
    }

    if (!openingSlots.some(s => s)) {
        return res.status(200).json({ slots: [], closed: true });
    }

    // Check for credentials
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const defaultCalendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!privateKey || !clientEmail || !defaultCalendarId) {
        console.warn('Google Calendar credentials not configured. Returning empty slots.');
        return res.status(200).json({
            slots: [],
            warning: 'Config required. Visit Vercel settings to add GOOGLE_PRIVATE_KEY, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_CALENDAR_ID.'
        });
    }

    try {
        const auth = new google.auth.JWT(clientEmail, null, cleanKey(privateKey), SCOPES);
        const calendar = google.calendar({ version: 'v3', auth });

        let professionalsToCheck = [];
        if (professional) {
            const { data } = await supabase.from('stylist_calendars').select('stylist_name, calendar_id, provided_services').eq('stylist_name', professional).single();
            if (data) {
                // If service is also provided, check if professional does it
                if (service) {
                    const canDoService = (data.provided_services || []).includes(service);
                    if (!canDoService) {
                        return res.status(200).json({ slots: [], message: `${professional} does not provide the ${service} service.` });
                    }
                }
                professionalsToCheck.push(data);
            }
        } else if (service) {
            // Find professionals who provide this service
            const { data } = await supabase.from('stylist_calendars').select('stylist_name, calendar_id, provided_services').contains('provided_services', [service]);
            professionalsToCheck = data || [];

            // FALLBACK: If NO stylists have this service assigned yet, assume ALL stylists can do it
            // This prevents the system from being "broken" before the admin configures it.
            if (professionalsToCheck.length === 0) {
                console.log('No stylists explicitly assigned to service, falling back to all stylists');
                const { data: allProfessionals } = await supabase.from('stylist_calendars').select('stylist_name, calendar_id');
                professionalsToCheck = allProfessionals || [];
            }
        } else {
            professionalsToCheck.push({ stylist_name: 'Default', calendar_id: defaultCalendarId });
        }

        if (professionalsToCheck.length === 0) {
            return res.status(200).json({ slots: [], message: 'No professionals available.' });
        }

        const timeMin = startOfDay(parseISO(date)).toISOString();
        const timeMax = endOfDay(parseISO(date)).toISOString();

        const allBusySlots = await Promise.all(professionalsToCheck.map(async (st) => {
            if (!st.calendar_id) return { professional: st.stylist_name, busy: [] };
            try {
                const response = await calendar.events.list({ calendarId: st.calendar_id, timeMin, timeMax, singleEvents: true });
                return {
                    professional: st.stylist_name,
                    busy: response.data.items.map(event => ({
                        start: parseISO(event.start.dateTime || event.start.date),
                        end: parseISO(event.end.dateTime || event.end.date)
                    }))
                };
            } catch (err) {
                console.error(`Error fetching calendar for ${st.stylist_name}:`, err.message);
                return { professional: st.stylist_name, busy: [] };
            }
        }));

        const availableSlots = [];
        const baseDate = startOfDay(parseISO(date));

        for (let hour = 8; hour < 21; hour++) {
            for (let mins of [0, 30]) {
                const slotStart = addMinutes(baseDate, hour * 60 + mins);
                const slotEnd = addMinutes(slotStart, duration);

                const dayIndex = hour - 8;
                if (!openingSlots[dayIndex]) continue;
                // If the slot extends into the next hour, check if that hour is also open
                if (duration > 30 && mins === 30 && hour < 20 && !openingSlots[dayIndex + 1]) continue;
                if (duration > 60 && hour < 19 && !openingSlots[dayIndex + 2]) continue;

                const availableProfessionals = allBusySlots.filter(st => {
                    const isBusy = st.busy.some(busy => {
                        const overlapStart = slotStart > busy.start ? slotStart : busy.start;
                        const overlapEnd = slotEnd < busy.end ? slotEnd : busy.end;
                        return overlapStart < overlapEnd;
                    });
                    return !isBusy;
                }).map(st => st.professional.trim());

                if (availableProfessionals.length > 0) {
                    availableSlots.push({
                        time: format(slotStart, 'HH:mm'),
                        professionals: availableProfessionals
                    });
                }
            }
        }

        return res.status(200).json({ slots: availableSlots });
    } catch (error) {
        console.error('Availability API Error:', error);
        return res.status(500).json({ error: 'Failed to fetch availability', details: error.message });
    }
}

function cleanKey(key) {
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
}
