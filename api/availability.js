import { google } from 'googleapis';
import { startOfDay, endOfDay, addMinutes, format, parseISO, isWithinInterval } from 'date-fns';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    // Check for credentials
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

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
            // Remove any surrounding quotes that might have been added in Vercel
            let cleaned = key.trim();
            if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
                cleaned = cleaned.substring(1, cleaned.length - 1);
            }
            // Replace literal \n with actual newlines
            return cleaned.replace(/\\n/g, '\n');
        };

        const auth = new google.auth.JWT(
            clientEmail,
            null,
            cleanKey(privateKey),
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
