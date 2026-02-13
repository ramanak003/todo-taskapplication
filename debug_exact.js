require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

async function debugExact() {
  console.log('Running exact app query...');
  
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("position", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: false });
  
  if (error) {
    console.log('❌ App Query Failed:', error.code, error.message);
    if (error.code === 'PGRST205') {
       console.log('⚠️  Confirmed: Schema Cache is still stale.');
    }
  } else {
    console.log('✅ App Query Succeeded!');
    console.log('Tasks found:', data.length);
  }
}

debugExact();
