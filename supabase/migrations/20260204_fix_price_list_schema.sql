-- Migration to fix price_categories and price_list schema consistency
-- This aligns the database with the frontend code expectations

DO $$ 
BEGIN 
    -- 1. Fix price_categories table
    -- Rename 'title' to 'name' if it exists (from old deployment guide)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='price_categories' AND column_name='title') THEN
        ALTER TABLE public.price_categories RENAME COLUMN title TO name;
    END IF;

    -- 2. Fix price_list table
    -- Add 'category' (TEXT) column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='price_list' AND column_name='category') THEN
        ALTER TABLE public.price_list ADD COLUMN category TEXT;
    END IF;

    -- Add 'sort_order' (INTEGER) column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='price_list' AND column_name='sort_order') THEN
        ALTER TABLE public.price_list ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;

    -- Change 'price' to TEXT to allow for flexible pricing (e.g. "from £50")
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='price_list' AND column_name='price') THEN
        ALTER TABLE public.price_list ALTER COLUMN price TYPE TEXT;
    END IF;

    -- 3. Sync data if category_id exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='price_list' AND column_name='category_id') THEN
        -- Link items to their category names
        UPDATE public.price_list pl
        SET category = pc.name
        FROM public.price_categories pc
        WHERE pl.category_id = pc.id
        AND pl.category IS NULL;
    END IF;

    -- 4. Enable RLS and Policies (just in case they are missing)
    -- This ensures the tables are accessible to the app
    ALTER TABLE public.price_categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.price_list ENABLE ROW LEVEL SECURITY;

END $$;

-- Re-create or update policies to ensure they are correct
DROP POLICY IF EXISTS "Public can view price categories" ON price_categories;
CREATE POLICY "Public can view price categories" ON price_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage price categories" ON price_categories;
CREATE POLICY "Admins can manage price categories" ON price_categories FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public can view price list" ON price_list;
CREATE POLICY "Public can view price list" ON price_list FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage price list" ON price_list;
CREATE POLICY "Admins can manage price list" ON price_list FOR ALL USING (auth.role() = 'authenticated');
