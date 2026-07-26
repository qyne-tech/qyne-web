/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL (same project as the mobile app). */
  readonly VITE_SUPABASE_URL: string
  /** Supabase anon/public key. */
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
