require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

async function listTables() {
  console.log('Listing all tables in public schema...');
  
  // PostgREST doesn't have a direct "list tables" endpoint in the JS client
  // But we can try to query common tables we expect
  const tables = ['tasks', 'projects', 'task_audit_logs'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ Table "${table}": ERROR (${error.code}: ${error.message})`);
    } else {
      console.log(`✅ Table "${table}": EXISTS`);
    }
  }
}

listTables();
