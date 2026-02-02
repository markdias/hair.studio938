-- Add footer description and terms and conditions settings to site_settings table
-- This allows admins to configure the footer text and legal terms

INSERT INTO site_settings (key, value)
VALUES 
  ('footer_description', 'Our salon is a space created for deep connection, beauty, and confidence. From expert coloring to bespoke styling, each offering is designed to enhance your natural look.'),
  ('terms_and_conditions', '')
ON CONFLICT (key) DO NOTHING;
