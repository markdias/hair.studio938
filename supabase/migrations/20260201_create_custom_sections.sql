-- Create custom_sections table for dynamic section builder
CREATE TABLE IF NOT EXISTS custom_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    menu_name TEXT NOT NULL,
    heading_name TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    element_limit INTEGER DEFAULT 10,
    background_color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE custom_sections ENABLE ROW LEVEL SECURITY;

-- Allow public to read enabled sections
CREATE POLICY "Public can view enabled custom sections"
    ON custom_sections
    FOR SELECT
    USING (enabled = true);

-- Allow authenticated users (admins) full access
CREATE POLICY "Authenticated users can manage custom sections"
    ON custom_sections
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Create index on sort_order for efficient ordering
CREATE INDEX idx_custom_sections_sort_order ON custom_sections(sort_order);

-- Create index on enabled for filtering
CREATE INDEX idx_custom_sections_enabled ON custom_sections(enabled);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_custom_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER custom_sections_updated_at
    BEFORE UPDATE ON custom_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_custom_sections_updated_at();
