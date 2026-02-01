import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking custom_sections...');
    const { data: sections, error: sError } = await supabase
        .from('custom_sections')
        .select('*, custom_section_elements(*)');

    if (sError) {
        console.error('Error fetching custom_sections:', sError);
    } else {
        console.log(`Found ${sections.length} custom sections`);
        sections.forEach(s => {
            console.log(`- Section: ${s.title} (ID: ${s.id}, Enabled: ${s.enabled})`);
            console.log(`  Elements: ${s.custom_section_elements?.length || 0}`);
        });
    }

    console.log('\nChecking site_page_sections...');
    const { data: pageFlow, error: pfError } = await supabase
        .from('site_page_sections')
        .select('*')
        .order('sort_order');

    if (pfError) {
        console.error('Error fetching site_page_sections:', pfError);
    } else {
        console.log(`Found ${pageFlow.length} entries in page flow`);
        pageFlow.forEach(pf => {
            console.log(`- ${pf.id}: ${pf.label} (Sort: ${pf.sort_order}, Enabled: ${pf.enabled})`);
        });
    }
}

checkData();
