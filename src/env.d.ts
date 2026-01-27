/// <reference path="../.astro/types.d.ts" />
/// <reference types="@astrojs/image/client" />

interface ImportMetaEnv {
  readonly PUBLIC_MIXPANEL_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
