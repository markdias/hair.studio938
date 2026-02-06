-- Create footer_sections table
CREATE TABLE IF NOT EXISTS footer_sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL, -- 'brand', 'links', 'contact', 'hours'
  heading text NOT NULL,
  sort_order int DEFAULT 0,
  enabled boolean DEFAULT true,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE footer_sections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access" ON footer_sections FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON footer_sections FOR ALL USING (auth.role() = 'authenticated');

-- Seed data with default values
INSERT INTO footer_sections (type, heading, sort_order, enabled) VALUES
('brand', 'Brand Info', 10, true),
('links', 'Important Links', 20, true),
('contact', 'Contact Us', 30, true),
('hours', 'Opening Hours', 40, true)
ON CONFLICT DO NOTHING; -- No natural key to conflict on really, but this is a one-off seed
