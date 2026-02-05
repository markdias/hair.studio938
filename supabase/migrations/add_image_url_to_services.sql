-- Add image_url column to services_overview table
ALTER TABLE public.services_overview 
ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'services_overview' AND column_name = 'image_url';
