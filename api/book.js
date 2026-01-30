import { google } from 'googleapis';
import { supabase } from './_lib/supabase.js';

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
    let calendarId = process.env.GOOGLE_CALENDAR_ID;

    // Fetch stylist-specific calendar if provided
    const stylistName = typeof stylist === 'string' ? stylist : stylist?.name;
    if (stylistName) {
        try {
            const { data, error } = await supabase
                .from('stylist_calendars')
                .select('calendar_id')
                .eq('stylist_name', stylistName)
                .single();

            if (data?.calendar_id) {
                calendarId = data.calendar_id;
                console.log(`Using specific calendar for ${stylistName}: ${calendarId}`);
            }
        } catch (err) {
            console.warn(`Could not fetch calendar for ${stylistName}, falling back to default:`, err.message);
        }
    }

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

        // Build ISO strings for start and end
        const startDateTime = new Date(`${date}T${time}:00`).toISOString();
        const endDateTime = new Date(new Date(`${date}T${time}:00`).getTime() + 60 * 60 * 1000).toISOString();

        console.log(`Final check - Using Calendar ID: ${calendarId}`);
        console.log(`Event details: ${service} for ${name} at ${startDateTime}`);

        try {
            const response = await calendar.events.insert({
                calendarId: calendarId,
                resource: {
                    summary: `[938] ${service} - ${name}`,
                    description: `Stylist: ${typeof stylist === 'string' ? stylist : stylist?.name}\nService: ${service}\nPhone: ${phone}\nEmail: ${email}`,
                    start: { dateTime: startDateTime, timeZone: 'Europe/London' },
                    end: { dateTime: endDateTime, timeZone: 'Europe/London' },
                    attendees: [{ email: email }],
                    reminders: { useDefault: true },
                },
            });
            console.log('Event created successfully:', response.data.id);
            return res.status(200).json({
                success: true,
                eventId: response.data.id,
                message: 'Booking confirmed and added to calendar.'
            });
        } catch (insertError) {
            console.error('Insert Event Error:', {
                status: insertError.status,
                message: insertError.message,
                errors: insertError.errors
            });
            throw insertError; // Caught by outer try/catch
        }
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
