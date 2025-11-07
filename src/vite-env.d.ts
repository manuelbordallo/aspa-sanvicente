/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_DEFAULT_LANGUAGE: string;
  readonly VITE_APP_DEFAULT_THEME: string;
  readonly VITE_ENABLE_NOTIFICATIONS: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_AUTH_TOKEN_KEY: string;
  readonly VITE_AUTH_TOKEN_EXPIRY: string;
  readonly VITE_ENABLE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
