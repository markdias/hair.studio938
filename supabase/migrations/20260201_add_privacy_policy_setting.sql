-- Add privacy policy setting to site_settings table
-- This allows admins to configure a privacy policy that displays in a modal

INSERT INTO site_settings (key, value)
VALUES ('privacy_policy', '')
ON CONFLICT (key) DO NOTHING;
