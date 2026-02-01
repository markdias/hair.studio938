-- Create custom_section_elements table for storing individual elements within sections
CREATE TABLE IF NOT EXISTS custom_section_elements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES custom_sections(id) ON DELETE CASCADE,
    element_type TEXT NOT NULL CHECK (element_type IN ('gallery', 'text_box', 'card', 'image', 'video')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE custom_section_elements ENABLE ROW LEVEL SECURITY;

-- Allow public to read elements of enabled sections
CREATE POLICY "Public can view elements of enabled sections"
    ON custom_section_elements
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM custom_sections
            WHERE custom_sections.id = custom_section_elements.section_id
            AND custom_sections.enabled = true
        )
    );

-- Allow authenticated users (admins) full access
CREATE POLICY "Authenticated users can manage custom section elements"
    ON custom_section_elements
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Create indexes for efficient querying
CREATE INDEX idx_custom_section_elements_section_id ON custom_section_elements(section_id);
CREATE INDEX idx_custom_section_elements_sort_order ON custom_section_elements(section_id, sort_order);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_custom_section_elements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER custom_section_elements_updated_at
    BEFORE UPDATE ON custom_section_elements
    FOR EACH ROW
    EXECUTE FUNCTION update_custom_section_elements_updated_at();

-- Add comment for documentation
COMMENT ON TABLE custom_section_elements IS 'Stores individual elements (gallery, text, cards, etc.) within custom sections';
COMMENT ON COLUMN custom_section_elements.config IS 'JSONB configuration specific to element type. Examples:
- gallery: {"images": [{"url": "", "alt": "", "caption": ""}], "columns": 3}
- text_box: {"content": "", "alignment": "left", "fontSize": "medium"}
- card: {"title": "", "description": "", "image_url": "", "link_url": "", "link_text": ""}
- image: {"url": "", "alt": "", "caption": "", "size": "full"}
- video: {"url": "", "type": "upload|embed", "autoplay": false}';
