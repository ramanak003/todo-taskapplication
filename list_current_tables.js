require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

async function listTables() {
  console.log('----------------------------------------');
  console.log('       DIAGNOSTIC: EXISTING TABLES      ');
  console.log('----------------------------------------');
  
  const tablesToCheck = ['projects', 'tasks', 'task_audit_logs', 'Profiles', 'profiles', 'Todo', 'todo'];
  
  for (const table of tablesToCheck) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST205') {
         console.log(`❌ [MISSING]  ${table}`);
      } else if (error.code === '42501') {
         console.log(`🔒 [HIDDEN]   ${table} (RLS Blocked)`);
      } else {
         console.log(`⚠️ [ERROR]    ${table} (${error.code})`);
      }
    } else {
      console.log(`✅ [EXISTS]   ${table}`);
    }
  }
  console.log('----------------------------------------');
}

listTables();
