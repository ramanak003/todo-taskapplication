require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

async function check() {
  console.log('Checking "projects" table...');
  const { data: pData, error: pError } = await supabase.from('projects').select('*').limit(1);
  if (pError) console.log('❌ Projects Error:', pError.code, pError.message);
  else console.log('✅ Projects: OK');

  console.log('Checking "tasks" table...');
  const { data: tData, error: tError } = await supabase.from('tasks').select('*').limit(1);
  if (tError) console.log('❌ Tasks Error:', tError.code, tError.message);
  else console.log('✅ Tasks: OK');
}

check();
