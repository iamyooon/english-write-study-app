/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  // 다른 env 변수들도 여기에 추가 가능
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

