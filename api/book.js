import { google } from 'googleapis';
import { supabase } from './_lib/supabase.js';
import nodemailer from 'nodemailer';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { stylist, service, date, time, name, email, phone, duration_minutes } = req.body;
    const duration = parseInt(duration_minutes) || 60;

    if (!date || !time || !name || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for Google credentials
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let calendarId = process.env.GOOGLE_CALENDAR_ID;

    // Check for Email credentials
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

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

    const timeZone = 'Europe/London';

    // If Google credentials are missing, simulate success (local/preview)
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
            if (!cleaned.startsWith('-')) {
                try {
                    const decoded = Buffer.from(cleaned, 'base64').toString('utf8');
                    if (decoded.includes('BEGIN PRIVATE KEY')) cleaned = decoded;
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

        const cleanedKey = cleanKey(privateKey);
        const auth = new google.auth.JWT(clientEmail, null, cleanedKey, SCOPES);
        const calendar = google.calendar({ version: 'v3', auth });

        // Build ISO strings for start and end
        const startDateTime = new Date(`${date}T${time}:00`).toISOString();
        const endDateTime = new Date(new Date(`${date}T${time}:00`).getTime() + duration * 60 * 1000).toISOString();

        console.log(`Creating event: ${service} for ${name} at ${startDateTime}`);

        // 1. Create Google Calendar Event
        const calendarResponse = await calendar.events.insert({
            calendarId: calendarId,
            resource: {
                summary: `[938] ${service} - ${name}`,
                description: `Stylist: ${stylistName}\nService: ${service}\nPhone: ${phone}\nEmail: ${email}`,
                start: { dateTime: startDateTime, timeZone: 'Europe/London' },
                end: { dateTime: endDateTime, timeZone: 'Europe/London' },
                reminders: { useDefault: true },
            },
        });

        console.log('Event created successfully:', calendarResponse.data.id);

        // 2. Send Email Notification (if SMTP is configured)
        if (smtpUser && smtpPass) {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: { user: smtpUser, pass: smtpPass }
                });

                // Fetch template and salon info from settings
                const { data: settingsData } = await supabase.from('site_settings').select('key, value');
                const settings = {};
                settingsData?.forEach(s => settings[s.key] = s.value);

                const formattedDate = new Date(date).toLocaleDateString('en-GB', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                });

                // Default template if none is set in database
                const defaultTemplate = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EAE0D5; border-radius: 12px;">
    <h2 style="color: #3D2B1F; border-bottom: 2px solid #EAE0D5; padding-bottom: 10px;">Booking Confirmed!</h2>
    <p>Hi {{name}},</p>
    <p>Thank you for choosing Studio 938. Your appointment is officially confirmed.</p>
    
    <div style="background-color: #FDFBF9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Service:</strong> {{service}}</p>
        <p style="margin: 5px 0;"><strong>Stylist:</strong> {{stylist}}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> {{date}}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> {{time}}</p>
    </div>
    
    <p style="font-size: 0.9rem; color: #666;">
        📍 <strong>Location:</strong> {{salon_location}}<br>
        📞 <strong>Phone:</strong> {{salon_phone}}
    </p>
    
    <p style="margin-top: 30px; font-size: 0.8rem; color: #999;">
        Please give us at least 24 hours notice for any cancellations or changes.
    </p>
</div>`;

                let html = settings.email_template || defaultTemplate;

                // Replace placeholders
                const replacements = {
                    '{{name}}': name,
                    '{{service}}': service,
                    '{{stylist}}': stylistName,
                    '{{date}}': formattedDate,
                    '{{time}}': time,
                    '{{salon_phone}}': settings.phone || '020 8445 1122',
                    '{{salon_location}}': settings.address || '938 High Road, London'
                };

                Object.keys(replacements).forEach(key => {
                    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                    html = html.replace(regex, replacements[key]);
                });

                const mailOptions = {
                    from: `"Studio 938" <${smtpUser}>`,
                    to: email, // Customer
                    bcc: smtpUser, // Salon Copy
                    subject: 'Booking Confirmation - Studio 938',
                    html: html
                };

                await transporter.sendMail(mailOptions);
                console.log('Confirmation email sent to:', email);
            } catch (emailError) {
                console.error('Email Sending Error:', emailError.message);
            }
        } else {
            console.warn('SMTP credentials missing, skipping email.');
        }

        return res.status(200).json({
            success: true,
            eventId: calendarResponse.data.id,
            message: 'Booking confirmed and added to calendar.'
        });

    } catch (error) {
        console.error('Booking API Error:', error.message);
        return res.status(500).json({
            error: 'Failed to complete booking',
            details: error.message
        });
    }
}
