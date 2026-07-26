import { createClient } from '@supabase/supabase-js'

/**
 * Shared Supabase client for the web app. Points at the SAME Supabase project as
 * the mobile app, so an athlete signs in with the same phone/email OTP identity.
 * Session persists to localStorage (supabase-js default) and auto-refreshes.
 */

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Fail loudly in dev rather than with a cryptic runtime error on first call.
  console.error(
    'Supabase env missing — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env (see .env.example).',
  )
}

export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    // OTP flow (no magic-link redirect), so we don't parse the URL for a session.
    detectSessionInUrl: false,
  },
})
