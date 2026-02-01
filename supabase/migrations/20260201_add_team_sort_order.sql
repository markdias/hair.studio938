-- Add sort_order column to stylist_calendars
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stylist_calendars' AND column_name = 'sort_order') THEN
        ALTER TABLE stylist_calendars ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;
