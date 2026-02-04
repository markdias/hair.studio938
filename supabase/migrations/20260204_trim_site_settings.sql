-- Trim whitespace from all site_settings values
UPDATE site_settings
SET value = TRIM(value);
