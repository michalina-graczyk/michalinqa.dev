import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import { defineConfig, envField } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://michalinqa.dev/",
  integrations: [mdx(), icon(), sitemap()],
  image: {
    responsiveStyles: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      PUBLIC_MIXPANEL_TOKEN: envField.string({
        context: "client",
        access: "public",
      }),
    },
  },
});
