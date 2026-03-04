const fs = require('fs');
const path = require('path');

// Mock a window and localStorage environment
global.window = {
  dispatchEvent: () => {},
  location: { reload: () => {} }
};
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = val; },
  removeItem(key) { delete this.store[key]; }
};
global.Event = class {};

// Load the supabase client (which uses the proxy)
const { supabase } = require('./lib/supabase');

async function testLocalMode() {
  console.log('--- Testing Local Mode ---');
  localStorage.setItem('supabase_fallback_active', 'true');
  
  const testTask = { title: 'Test Task', status: 'todo', priority: 'medium' };
  
  console.log('1. Inserting task...');
  await supabase.from('tasks').insert([testTask]);
  
  console.log('2. Selecting tasks...');
  const { data, error } = await supabase.from('tasks').select('*');
  
  if (error) {
    console.error('❌ Local Mode Error:', error);
  } else {
    console.log('✅ Local Mode Data:', data);
    if (data.length > 0 && data[0].title === 'Test Task') {
      console.log('✅ Local Mode Persistence: SUCCESS');
    } else {
      console.log('❌ Local Mode Persistence: FAILED');
    }
  }
}

testLocalMode();
