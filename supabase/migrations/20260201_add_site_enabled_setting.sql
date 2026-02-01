-- Add site_enabled setting to control website availability
-- When set to 'false', the website will display a maintenance screen
-- When set to 'true', the website operates normally

INSERT INTO site_settings (key, value)
VALUES ('site_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
