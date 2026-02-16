import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

// Validation and warnings
if (process.env.NODE_ENV === "production") {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      'CRITICAL: Missing Supabase environment variables in PRODUCTION. ' +
      'Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY to your Vercel settings.'
    )
  } else if (!supabaseUrl.startsWith('https://')) {
    console.error(
      'CRITICAL: NEXT_PUBLIC_SUPABASE_URL must start with https://. ' +
      'Current value: "' + supabaseUrl + '"'
    )
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://dummy.supabase.co',
  supabaseAnonKey || 'dummy-key'
)
