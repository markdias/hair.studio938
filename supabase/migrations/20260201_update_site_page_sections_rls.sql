-- Update RLS policy for site_page_sections to allow public to see all rows
-- This is necessary so the frontend can see 'enabled = false' and respect it, 
-- rather than thinking the section is missing and falling back to default-on.

DROP POLICY IF EXISTS "Public users can view enabled sections" ON site_page_sections;

CREATE POLICY "Public users can view all sections" ON site_page_sections
    FOR SELECT USING (true);
