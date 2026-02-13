require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

async function inspectSchema() {
  console.log('Inspecting "tasks" table schema...');
  
  // We can't easily list columns via the JS client without RPC or querying a specific row
  // Let's try to select everything from a very limited query and check the keys of the first object
  const { data, error } = await supabase.from('tasks').select('*').limit(1);

  if (error) {
    console.error('❌ Error fetching from tasks:', error);
    process.exit(1);
  }

  if (data && data.length > 0) {
    console.log('✅ Columns found:', Object.keys(data[0]).join(', '));
  } else {
    // If table is empty, we can try to insert a dummy row and rollback, 
    // but better is to try to select specific columns that should exist.
    console.log('Table is empty. Checking individual columns...');
    const columns = ['id', 'title', 'status', 'priority', 'position', 'project_id'];
    for (const col of columns) {
      const { error: colError } = await supabase.from('tasks').select(col).limit(1);
      if (colError) {
        console.log(`❌ Column "${col}": MISSING or ERROR (${colError.message})`);
      } else {
        console.log(`✅ Column "${col}": EXISTS`);
      }
    }
  }
}

inspectSchema();
