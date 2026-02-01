-- Add section-specific settings (names and colors) to site_settings table
-- This allows admins to customize the branding and appearance of each section

INSERT INTO site_settings (key, value)
VALUES 
  -- Services Section
  ('services_menu_name', 'Services'),
  ('services_heading_name', 'Our Services'),
  ('services_bg_color', ''),
  ('services_text_color', ''),
  
  -- Team Section
  ('team_menu_name', 'Team'),
  ('team_heading_name', 'Meet Our Stylists'),
  ('team_bg_color', ''),
  ('team_text_color', ''),
  
  -- Pricing Section
  ('pricing_menu_name', 'Pricing'),
  ('pricing_heading_name', 'Service Menu'),
  ('pricing_bg_color', ''),
  ('pricing_text_color', ''),
  
  -- Testimonials Section
  ('testimonials_menu_name', 'Testimonials'),
  ('testimonials_heading_name', 'Client Stories'),
  ('testimonials_bg_color', ''),
  ('testimonials_text_color', ''),
  
  -- Gallery Section
  ('gallery_menu_name', 'Gallery'),
  ('gallery_heading_name', 'Our Work'),
  ('gallery_bg_color', ''),
  ('gallery_text_color', ''),
  
  -- Booking Section
  ('booking_heading_name', 'Book Your Visit'),
  ('booking_bg_color', ''),
  ('booking_text_color', ''),
  
  -- Contact Section
  ('contact_menu_name', 'Contact'),
  ('contact_heading_name', 'Contact Us'),
  ('contact_bg_color', ''),
  ('contact_text_color', '')
ON CONFLICT (key) DO NOTHING;
