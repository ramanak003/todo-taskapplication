require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

async function check() {
  console.log('\nChecking Database Status...\n');
  
  const { error } = await supabase.from('tasks').select('*').limit(1);

  if (error) {
    if (error.code === 'PGRST205') {
      console.log('🔴 FAILURE: The "tasks" table is STILL MISSING.');
      console.log('👉 You have NOT run the SQL command correctly yet.');
    } else {
      console.log('🔴 ERROR:', error.code, error.message);
    }
    process.exit(1);
  } else {
    console.log('🟢 SUCCESS: The "tasks" table EXISTS!');
    console.log('🚀 You can now refresh your app.');
    process.exit(0);
  }
}

check();
