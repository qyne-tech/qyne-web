/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the QYNE app (the post-login dashboard) for the Log in / Sign up
   * hand-off. Optional — defaults are derived from the host (see `appUrl`). Set
   * in production, e.g. https://app.qyne.one. The marketing site itself makes no
   * backend or Supabase calls, so no other env is needed.
   */
  readonly VITE_APP_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
