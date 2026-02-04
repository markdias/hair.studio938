-- Ensure table exists
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated full access" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated insert" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated update" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated delete" ON site_settings;
DROP POLICY IF EXISTS "Public read access" ON site_settings;

-- Create comprehensive policies
CREATE POLICY "Allow public read access" 
ON site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated full access" 
ON site_settings 
FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');
