-- Create price_categories table
CREATE TABLE IF NOT EXISTS price_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE price_categories ENABLE ROW LEVEL SECURITY;

-- Public can view
CREATE POLICY "Public can view price categories" ON price_categories
    FOR SELECT USING (true);

-- Authenticated can manage
CREATE POLICY "Admins can manage price categories" ON price_categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert existing categories as defaults
INSERT INTO price_categories (name, sort_order) VALUES
('CUT & STYLING', 10),
('COLOURING', 20),
('HAIR TREATMENTS', 30),
('HAIR EXTENSIONS', 40),
('MAKE UP', 50)
ON CONFLICT (name) DO NOTHING;
