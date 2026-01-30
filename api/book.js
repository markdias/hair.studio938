import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { stylist, service, date, time, name, email, phone } = req.body;

    if (!date || !time || !name || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for credentials
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    // Use a default timezone if not specified, or Europe/London as requested
    const timeZone = 'Europe/London';

    if (!privateKey || !clientEmail || !calendarId) {
        console.warn('Google Calendar credentials missing. Configuration required in Vercel.');
        return res.status(200).json({
            success: true,
            message: 'Simulated success. Please add GOOGLE_PRIVATE_KEY, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_CALENDAR_ID to Vercel.'
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

        // Build ISO strings for start and end
        // Assuming 1 hour slot for now
        const startDateTime = new Date(`${date}T${time}:00`).toISOString();
        const endDateTime = new Date(new Date(`${date}T${time}:00`).getTime() + 60 * 60 * 1000).toISOString();

        console.log(`Attempting to create event: ${service} for ${name} at ${startDateTime}`);

        const event = {
            summary: `[938] ${service} - ${name}`,
            description: `Stylist: ${stylist?.name || 'Any'}\nService: ${service}\nPhone: ${phone}\nEmail: ${email}`,
            start: {
                dateTime: startDateTime,
                timeZone: timeZone,
            },
            end: {
                dateTime: endDateTime,
                timeZone: timeZone,
            },
            attendee: [
                { email: email }
            ],
            reminders: {
                useDefault: true,
            },
        };

        const response = await calendar.events.insert({
            calendarId: calendarId,
            resource: event,
        });

        console.log('Event created successfully:', response.data.id);
        return res.status(200).json({
            success: true,
            eventId: response.data.id,
            message: 'Booking confirmed and added to calendar.'
        });
    } catch (error) {
        console.error('Google Calendar API Error Details:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            errors: error.errors
        });

        // Return a 500 but with helpful info for the user in logs
        return res.status(500).json({
            error: 'Failed to create calendar event',
            details: error.message,
            suggestion: 'Check if the Service Account has been shared with the calendar in Google Calendar settings.'
        });
    }
}
