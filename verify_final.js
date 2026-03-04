require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

async function verify() {
  console.log('------------------------------------------------');
  console.log('🔍 FINAL SYSTEM VERIFICATION');
  console.log('------------------------------------------------');

  try {
    // 1. Check Projects Table
    const { data: projects, error: pError } = await supabase.from('projects').select('*').limit(1);
    if (pError) {
      console.log(`❌ PROJECTS Table: FAILED (${pError.code}) - ${pError.message}`);
    } else {
      console.log(`✅ PROJECTS Table: OK`);
    }

    // 2. Check Tasks Table
    const { data: tasks, error: tError } = await supabase.from('tasks').select('*').limit(1);
    if (tError) {
      if (tError.code === 'PGRST205') {
         console.log(`❌ TASKS Table: MISSING (Cache error or table not created)`);
      } else {
         console.log(`❌ TASKS Table: FAILED (${tError.code}) - ${tError.message}`);
      }
    } else {
      console.log(`✅ TASKS Table: OK`);
      
      // 3. Check Position Column (only if table exists)
      const { data: colData, error: colError } = await supabase.from('tasks').select('position').limit(1);
      if (colError) {
        console.log(`❌ POSITION Column: MISSING or ERROR (${colError.code})`);
      } else {
        console.log(`✅ POSITION Column: OK`);
      }
    }
  } catch (err) {
    console.error('Unexpected error during verification:', err);
  }

  console.log('------------------------------------------------');
}

verify();
