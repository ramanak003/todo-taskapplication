require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

async function debug() {
  console.log('Debugging tasks table...');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  // Try to select just ID
  const { data, error } = await supabase.from('tasks').select('id').limit(1);
  
  if (error) {
    console.log('❌ Error selecting id:', error);
    console.log('Error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ Success selecting id:', data);
  }
}

debug();
