import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTheme() {
    const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .like('key', 'theme_%');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Current Theme Settings in DB:');
        console.table(data);
    }
}

checkTheme();
