-- ============================================
-- Complete Database Setup (Schema Only)
-- ============================================

-- SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    key TEXT UNIQUE NOT NULL,
    value TEXT
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.site_settings
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.site_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.site_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.site_settings
    FOR DELETE USING (auth.role() = 'authenticated');

-- CLIENTS TABLE
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE, -- Nullable, but unique if present
    phone TEXT,
    notes TEXT,
    CONSTRAINT clients_contact_check CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.clients
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.clients
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.clients
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.clients
    FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS clients_email_idx ON public.clients (email);

-- APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    professional TEXT NOT NULL,
    service TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'confirmed',
    notes TEXT,
    google_event_id TEXT
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.appointments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.appointments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.appointments
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.appointments
    FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS appointments_professional_idx ON public.appointments (professional);
CREATE INDEX IF NOT EXISTS appointments_start_time_idx ON public.appointments (start_time);

-- TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT,
    description TEXT NOT NULL,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.testimonials
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.testimonials
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.testimonials
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.testimonials
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS testimonials_sort_order_idx ON public.testimonials (sort_order);

-- PHONE NUMBERS TABLE
CREATE TABLE IF NOT EXISTS public.phone_numbers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    number TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('phone', 'whatsapp', 'both')),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view phone numbers" ON public.phone_numbers
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert phone numbers" ON public.phone_numbers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update phone numbers" ON public.phone_numbers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete phone numbers" ON public.phone_numbers
    FOR DELETE USING (auth.role() = 'authenticated');

-- PRICE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.price_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.price_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.price_categories FOR SELECT USING (true);
CREATE POLICY "Auth write access" ON public.price_categories FOR ALL USING (auth.role() = 'authenticated');

-- PRICE LIST TABLE
CREATE TABLE IF NOT EXISTS public.price_list (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.price_categories(id),
    item_name TEXT NOT NULL,
    price DECIMAL(10,2),
    duration_minutes INTEGER DEFAULT 60,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.price_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.price_list FOR SELECT USING (true);
CREATE POLICY "Auth write access" ON public.price_list FOR ALL USING (auth.role() = 'authenticated');

-- STAFF CALENDARS TABLE
CREATE TABLE IF NOT EXISTS public.staff_calendars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_name TEXT NOT NULL UNIQUE,
    calendar_id TEXT NOT NULL,
    image_url TEXT,
    role TEXT,
    sort_order INTEGER DEFAULT 0,
    provided_services TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.staff_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view staff calendars" ON public.staff_calendars
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage staff calendars" ON public.staff_calendars
    FOR ALL USING (auth.role() = 'authenticated');

-- SERVICES OVERVIEW TABLE
CREATE TABLE IF NOT EXISTS public.services_overview (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.services_overview ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.services_overview FOR SELECT USING (true);
CREATE POLICY "Auth write access" ON public.services_overview FOR ALL USING (auth.role() = 'authenticated');

-- GALLERY IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Auth write access" ON public.gallery_images FOR ALL USING (auth.role() = 'authenticated');

-- CUSTOM SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.custom_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    menu_name TEXT NOT NULL,
    heading_name TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    element_limit INTEGER DEFAULT 10,
    background_color TEXT,
    text_color TEXT DEFAULT '#2A1D15',
    is_separate_page BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.custom_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.custom_sections FOR SELECT USING (enabled = true);
CREATE POLICY "Auth manage" ON public.custom_sections FOR ALL USING (auth.role() = 'authenticated');

-- CUSTOM SECTION ELEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.custom_section_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.custom_sections(id) ON DELETE CASCADE,
    element_type TEXT NOT NULL CHECK (element_type IN ('gallery', 'text_box', 'card', 'image', 'video')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.custom_section_elements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.custom_section_elements FOR SELECT USING (true);
CREATE POLICY "Auth manage" ON public.custom_section_elements FOR ALL USING (auth.role() = 'authenticated');

-- SITE PAGE SECTIONS (ORDERING)
CREATE TABLE IF NOT EXISTS public.site_page_sections (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT false,
    sort_order INTEGER NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_page_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.site_page_sections FOR SELECT USING (enabled = true);
CREATE POLICY "Auth manage" ON public.site_page_sections FOR ALL USING (auth.role() = 'authenticated');
