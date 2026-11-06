/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the QYNE app (the post-login dashboard) for the Log in / Sign up
   * hand-off. Optional — defaults are derived from the host (see `appUrl`). Set
   * in production, e.g. https://app.qyne.one.
   */
  readonly VITE_APP_URL?: string
  /**
   * Base URL of qyne-service, read only for the public article catalogue.
   * Optional — defaults are derived from the host (see `apiUrl`). Set in
   * production, e.g. https://api.qyne.one.
   */
  readonly VITE_API_URL?: string
  /**
   * `'true'` builds the article CMS at /cms into a deployed site, talking to
   * `VITE_API_URL` / the host's API. Staging only: the deploy workflow forces
   * it off for production. Always on in `npm run dev`.
   */
  readonly VITE_ENABLE_CMS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
