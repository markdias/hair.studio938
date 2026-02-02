-- Add payment methods setting to site_settings table
-- This allows admins to configure which payment icons are displayed in the footer

INSERT INTO site_settings (key, value)
VALUES ('payment_methods', 'visa,mastercard,paypal')
ON CONFLICT (key) DO NOTHING;
