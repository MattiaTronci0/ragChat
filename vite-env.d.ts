/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly NODE_ENV: string
  // più variabili d'ambiente...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 