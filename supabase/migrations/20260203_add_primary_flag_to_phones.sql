-- Migration to add is_primary flag to phone_numbers
ALTER TABLE public.phone_numbers ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

-- Add a comment to explain the purpose
COMMENT ON COLUMN public.phone_numbers.is_primary IS 'If true, this number is used as the primary salon contact in emails and placeholders.';

-- Set the first phone number as primary if none are primary
UPDATE public.phone_numbers 
SET is_primary = true 
WHERE id = (SELECT id FROM public.phone_numbers ORDER BY display_order LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM public.phone_numbers WHERE is_primary = true);
