-- Create phone_numbers table for multi-phone number support
CREATE TABLE IF NOT EXISTS phone_numbers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    number TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('phone', 'whatsapp', 'both')),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can view phone numbers" ON phone_numbers
    FOR SELECT
    USING (true);

-- Allow authenticated users to manage phone numbers
CREATE POLICY "Authenticated users can insert phone numbers" ON phone_numbers
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update phone numbers" ON phone_numbers
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete phone numbers" ON phone_numbers
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Migrate existing phone and whatsapp data from site_settings
DO $$
DECLARE
    phone_value TEXT;
    whatsapp_value TEXT;
BEGIN
    -- Get existing phone and whatsapp values
    SELECT value INTO phone_value FROM site_settings WHERE key = 'phone';
    SELECT value INTO whatsapp_value FROM site_settings WHERE key = 'whatsapp';
    
    -- If both exist and are the same, create one entry with type 'both'
    IF phone_value IS NOT NULL AND whatsapp_value IS NOT NULL AND phone_value = whatsapp_value THEN
        INSERT INTO phone_numbers (number, type, display_order)
        VALUES (phone_value, 'both', 1);
    ELSE
        -- If phone exists, create entry with type 'phone'
        IF phone_value IS NOT NULL THEN
            INSERT INTO phone_numbers (number, type, display_order)
            VALUES (phone_value, 'phone', 1);
        END IF;
        
        -- If whatsapp exists and different from phone, create entry with type 'whatsapp'
        IF whatsapp_value IS NOT NULL THEN
            INSERT INTO phone_numbers (number, type, display_order)
            VALUES (whatsapp_value, 'whatsapp', 2);
        END IF;
    END IF;
END $$;

-- Note: We keep the old phone and whatsapp settings in site_settings for now
-- They can be removed in a future migration after confirming everything works
