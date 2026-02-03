-- Migration to fix client email and add stylist service assignments

-- 1. Make email nullable in clients table
ALTER TABLE public.clients ALTER COLUMN email DROP NOT NULL;

-- 2. Create stylist_services junction table
CREATE TABLE IF NOT EXISTS public.stylist_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stylist_id UUID NOT NULL REFERENCES public.stylist_calendars(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES public.price_list(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(stylist_id, service_id)
);

-- Enable RLS
ALTER TABLE public.stylist_services ENABLE ROW LEVEL SECURITY;

-- Policies for stylist_services
CREATE POLICY "Public can view stylist services" ON public.stylist_services
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage stylist services" ON public.stylist_services
    FOR ALL USING (auth.role() = 'authenticated');
