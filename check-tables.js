require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking for "tasks" table...');
  const { data, error } = await supabase.from('tasks').select('count', { count: 'exact', head: true });

  if (error) {
    if (error.code === '42P01') {
      console.log('❌ Table "tasks" DOES NOT EXIST yet.');
      process.exit(1); 
    } else {
      console.error('❌ Error checking table:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Table "tasks" EXISTS! You are ready.');
    process.exit(0);
  }
}

checkTables();
