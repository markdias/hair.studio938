-- Add intro video URL setting to site_settings table
-- This allows admins to configure an optional intro video that plays on first visit

INSERT INTO site_settings (key, value)
VALUES ('intro_video_url', '')
ON CONFLICT (key) DO NOTHING;
