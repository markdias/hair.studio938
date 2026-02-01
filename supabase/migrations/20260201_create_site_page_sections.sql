-- Create table for global section ordering
CREATE TABLE IF NOT EXISTS site_page_sections (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT false,
    sort_order INTEGER NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_page_sections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public users can view enabled sections" ON site_page_sections
    FOR SELECT USING (enabled = true);

CREATE POLICY "Authenticated users can manage all sections" ON site_page_sections
    FOR ALL USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_page_sections_updated_at
    BEFORE UPDATE ON site_page_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Initial seed for fixed sections
INSERT INTO site_page_sections (id, label, is_custom, sort_order)
VALUES 
    ('services', 'Services', false, 10),
    ('team', 'Team', false, 20),
    ('pricing', 'Pricing', false, 30),
    ('testimonials', 'Testimonials', false, 40),
    ('booking', 'Booking', false, 50),
    ('gallery', 'Gallery', false, 60),
    ('contact', 'Contact', false, 70)
ON CONFLICT (id) DO NOTHING;
