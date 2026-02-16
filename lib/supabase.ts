import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xvjysaynkuknhhkzoukh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2anlzYXlua3Vrbmhoa3pvdWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MDUzMDEsImV4cCI6MjA4NjE4MTMwMX0.SUWnAZmyJpKIwpgtbRohaVIxgTIHR-u_fJjX1sFEUmQ'

// Validation and warnings
if (process.env.NODE_ENV === "production") {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) {
    console.warn(
      'INFO: Using fallback Supabase environment variables in PRODUCTION.'
    )
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
