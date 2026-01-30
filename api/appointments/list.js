import { google } from 'googleapis';
import { supabase } from '../_lib/supabase.js';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

    if (!privateKey || !clientEmail) {
        return res.status(500).json({ error: 'Google Calendar credentials not configured' });
    }

    try {
        // Fetch all stylist calendars
        const { data: stylists, error: stylistError } = await supabase
            .from('stylist_calendars')
            .select('stylist_name, calendar_id')
            .not('calendar_id', 'is', null);

        if (stylistError) throw stylistError;

        if (!stylists || stylists.length === 0) {
            return res.status(200).json({ appointments: [] });
        }

        // Clean and prepare auth
        const cleanKey = (key) => {
            if (!key) return null;
            let cleaned = key.trim();
            if (!cleaned.startsWith('-')) {
                try {
                    const decoded = Buffer.from(cleaned, 'base64').toString('utf8');
                    if (decoded.includes('BEGIN PRIVATE KEY')) {
                        cleaned = decoded;
                    }
                } catch (e) { /* not base64 */ }
            }
            cleaned = cleaned.replace(/^["']|["']$/g, '');
            cleaned = cleaned.replace(/\\n/g, '\n');
            if (cleaned.includes('BEGIN PRIVATE KEY') && !cleaned.includes('\n')) {
                cleaned = cleaned
                    .replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
                    .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
            }
            return cleaned.trim();
        };

        const auth = new google.auth.JWT(
            clientEmail,
            null,
            cleanKey(privateKey),
            SCOPES
        );

        const calendar = google.calendar({ version: 'v3', auth });

        // Fetch events from all calendars
        const allAppointments = [];
        const now = new Date().toISOString();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 90); // Next 90 days

        console.log(`Found ${stylists?.length} stylists with calendars`);

        for (const stylist of stylists) {
            if (!stylist.calendar_id) {
                console.log(`Skipping stylist ${stylist.stylist_name} (no calendar_id)`);
                continue;
            }

            try {
                console.log(`Fetching events for ${stylist.stylist_name} (${stylist.calendar_id})...`);
                const response = await calendar.events.list({
                    calendarId: stylist.calendar_id,
                    timeMin: now,
                    timeMax: futureDate.toISOString(),
                    singleEvents: true,
                    orderBy: 'startTime',
                    maxResults: 100,
                });

                const events = response.data.items || [];
                console.log(`Found ${events.length} events for ${stylist.stylist_name}`);

                // Parse and format events
                events.forEach(event => {
                    // Parse customer info from description
                    const description = event.description || '';
                    const customerInfo = {
                        name: '',
                        email: '',
                        phone: '',
                        service: ''
                    };

                    // Extract from description (format: "Stylist: X\nService: Y\nPhone: Z\nEmail: W")
                    const nameMatch = event.summary?.match(/\[938\]\s*(.+?)\s*-\s*(.+)/);
                    if (nameMatch) {
                        customerInfo.service = nameMatch[1];
                        customerInfo.name = nameMatch[2];
                    }

                    const serviceMatch = description.match(/Service:\s*(.+)/);
                    if (serviceMatch) customerInfo.service = serviceMatch[1].trim();

                    const phoneMatch = description.match(/Phone:\s*(.+)/);
                    if (phoneMatch) customerInfo.phone = phoneMatch[1].trim();

                    const emailMatch = description.match(/Email:\s*(.+)/);
                    if (emailMatch) customerInfo.email = emailMatch[1].trim();

                    allAppointments.push({
                        id: event.id,
                        stylist: stylist.stylist_name,
                        calendarId: stylist.calendar_id,
                        customer: customerInfo,
                        startTime: event.start.dateTime || event.start.date,
                        endTime: event.end.dateTime || event.end.date,
                        summary: event.summary,
                        description: event.description,
                    });
                });
            } catch (err) {
                console.error(`Error fetching calendar for ${stylist.stylist_name}:`, err.message);
            }
        }

        console.log(`Total appointments found: ${allAppointments.length}`);

        // Sort by start time
        allAppointments.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        return res.status(200).json({ appointments: allAppointments });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return res.status(500).json({
            error: 'Failed to fetch appointments',
            details: error.message
        });
    }
}
