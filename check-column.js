require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

async function checkColumn() {
  console.log('Connecting to:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Checking for "position" column in "tasks"...');
  
  const { data, error } = await supabase.from('tasks').select('position').limit(1);

  if (error) {
    console.log('❌ ERROR:', error.message);
    console.log('Error Code:', error.code);
  } else {
    console.log('✅ Column "position" exists.');
  }
}

checkColumn();
