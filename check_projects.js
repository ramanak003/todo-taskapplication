require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

async function checkProjects() {
  console.log('Checking projects table...');
  const { data, error } = await supabase.from('projects').select('id').limit(1);
  
  if (error) {
    console.log('Error checking projects:', error.code, error.message);
  } else {
    console.log('Projects table exists. Row count:', data.length);
  }
}

checkProjects();
