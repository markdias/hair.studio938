import { google } from 'googleapis';
import { supabase } from './_lib/supabase.js';
import nodemailer from 'nodemailer';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { stylist, service, date, time, name, email, phone, duration_minutes, send_email = true } = req.body;
    const duration = parseInt(duration_minutes) || 60;

    if (!date || !time || !name || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const timezone = 'Europe/London';

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

        const cleanedKey = cleanKey(privateKey);
        const auth = new google.auth.JWT(clientEmail, null, cleanedKey, SCOPES);
        const calendar = google.calendar({ version: 'v3', auth });

        // Identify which stylists/calendars to check
        let stylistsToCheck = [];
        let finalStylistName = typeof stylist === 'string' ? stylist : stylist?.name;

        if (finalStylistName) {
            // Specific stylist requested
            const { data } = await supabase.from('stylist_calendars').select('stylist_name, calendar_id').eq('stylist_name', finalStylistName).single();
            if (data) stylistsToCheck.push(data);
        } else if (service) {
            // "Any" professional - find all who can do this service
            const { data } = await supabase.from('stylist_calendars').select('stylist_name, calendar_id').contains('provided_services', [service]);
            stylistsToCheck = data || [];
        } else {
            // Fallback to default
            stylistsToCheck.push({ stylist_name: 'Default', calendar_id: calendarId });
        }

        if (stylistsToCheck.length === 0) {
            return res.status(400).json({ error: 'No professionals available for this service.' });
        }

        // --- RE-VERIFY AVAILABILITY & ASSIGN STYLIST ---
        const startDateTime = new Date(`${date}T${time}:00`).toISOString();
        const endDateTime = new Date(new Date(`${date}T${time}:00`).getTime() + duration * 60 * 1000).toISOString();

        // Check each eligible stylist until we find one who is free
        let assignedStylist = null;

        // Shuffle stylistsToCheck to randomize assignment among available professionals
        const shuffledStylists = stylistsToCheck.sort(() => 0.5 - Math.random());

        for (const st of shuffledStylists) {
            if (!st.calendar_id) continue;

            try {
                const checkRes = await calendar.events.list({
                    calendarId: st.calendar_id,
                    timeMin: startDateTime,
                    timeMax: endDateTime,
                    singleEvents: true,
                    maxResults: 1
                });

                const events = checkRes.data.items || [];
                if (events.length === 0) {
                    assignedStylist = st;
                    break; // Found a free professional!
                }
            } catch (err) {
                console.error(`Error checking availability for ${st.stylist_name}:`, err.message);
            }
        }

        if (!assignedStylist) {
            return res.status(400).json({ error: 'Sorry, the requested time slot is no longer available. Please choose another time.' });
        }

        finalStylistName = assignedStylist.stylist_name;
        calendarId = assignedStylist.calendar_id;

        console.log(`Assigned booking to ${finalStylistName} (${calendarId})`);

        // Proceed with simulated success check if credentials are still missing for the assigned calendar 
        // (though in reality, if we're here, we usually have them)
        if (!privateKey || !clientEmail || !calendarId) {
            return res.status(200).json({ success: true, message: 'Simulated success (missing credentials)' });
        }


        // 0. UPSERT CLIENT
        // Check if client exists, if not create, if yes update phone/name
        try {
            const { error: clientError } = await supabase
                .from('clients')
                .upsert(
                    { email, name, phone },
                    { onConflict: 'email', ignoreDuplicates: false }
                );

            if (clientError) {
                console.warn('Error upserting client:', clientError.message);
            } else {
                console.log('Client record synced for:', email);
            }
        } catch (clientErr) {
            console.warn('Client sync failed:', clientErr.message);
        }

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

        // 2. Send Email Notification (if SMTP is configured and send_email is true)
        if (smtpUser && smtpPass && send_email) {
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

                // Get subject from settings or use default
                const emailSubject = settings.email_subject || 'Booking Confirmation - Studio 938';
                console.log(`Sending email with subject: "${emailSubject}"`);

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
                    subject: emailSubject,
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
