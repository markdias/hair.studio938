import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ziyorjkvudlarrdrgaef.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppeW9yamt2dWRsYXJyZHJnYWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODE5MzMsImV4cCI6MjA4NTM1NzkzM30.KyNQLQJwPn3xc7b81vgShuj9HpkF-QFCg9_yvmN53hQ";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSettings() {
    console.log('Fetching all site_settings...');
    const { data, error } = await supabase
        .from('site_settings')
        .select('*');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('All Settings in DB:');
        data.forEach(s => {
            if (s.key.includes('color') || s.key.includes('bg') || s.key.includes('navbar')) {
                console.log(`${s.key}: ${s.value}`);
            }
        });
        // Also show a few others just in case
        console.log('--- Other keys ---');
        console.log(data.map(s => s.key).join(', '));
    }
}

checkSettings();
