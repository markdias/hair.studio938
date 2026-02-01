-- Add text_color column to custom_sections table
ALTER TABLE custom_sections ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT 'var(--primary-brown)';
