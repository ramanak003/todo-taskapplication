import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ymnqustfjfyynjyprpkd.supabase.co').trim();
    // Ignore poisoned NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY variable injected by Vercel
    const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_BipApjSTLAd-hXW_Krf2Og_5SqJGKcC';
    const supabaseAnonKey = rawAnonKey.replace(/['"]/g, '').trim();

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(
        new URL('/sign-in?error=Configuration error', requestUrl.origin)
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      )
    }

    // Success - redirect to the app
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }

  // No code parameter - redirect to sign in
  return NextResponse.redirect(new URL('/sign-in', requestUrl.origin))
}
