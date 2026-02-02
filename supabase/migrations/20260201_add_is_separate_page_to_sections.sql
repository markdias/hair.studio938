-- Add is_separate_page column to site_page_sections
ALTER TABLE site_page_sections ADD COLUMN IF NOT EXISTS is_separate_page BOOLEAN DEFAULT false;

-- Add is_separate_page column to custom_sections
ALTER TABLE custom_sections ADD COLUMN IF NOT EXISTS is_separate_page BOOLEAN DEFAULT false;
