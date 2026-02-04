-- Add provided_services column to stylist_calendars
-- This allows us to track which services each stylist can perform
ALTER TABLE public.stylist_calendars ADD COLUMN IF NOT EXISTS provided_services TEXT[] DEFAULT '{}';

-- Optional: Seed with existing services for existing stylists if needed
-- For now we leave it empty so the admin can configure it
