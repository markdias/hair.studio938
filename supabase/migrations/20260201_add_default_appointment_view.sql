-- Add default_appointment_view setting to site_settings
INSERT INTO site_settings (key, value)
VALUES ('default_appointment_view', 'list')
ON CONFLICT (key) DO NOTHING;
