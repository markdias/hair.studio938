-- Make email nullable in clients table to support phone-only bookings
ALTER TABLE public.clients ALTER COLUMN email DROP NOT NULL;

-- Remove unique constraint from email as it's no longer the sole identifier for duplicate checking
-- Note: We still want unique emails for those who provide them, but upsert becomes handled by code logic
-- Actually, keep unique but it only applies to non-null values.

-- Ensure at least one contact method is provided
ALTER TABLE public.clients ADD CONSTRAINT clients_contact_check 
CHECK (email IS NOT NULL OR phone IS NOT NULL);
