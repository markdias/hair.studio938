-- Add additional theme settings to site_settings table
INSERT INTO site_settings (key, value)
VALUES
  ('theme_white', '#FFFFFF'),
  ('theme_black', '#000000'),
  ('theme_success', '#22c55e'),
  ('theme_error', '#ef4444'),
  ('theme_booking_card_bg', '#FFFFFF'),
  ('theme_pricing_card_bg', '#EDE4DB'),
  ('theme_input_bg', '#F9F9F9')
ON CONFLICT (key) DO NOTHING;
