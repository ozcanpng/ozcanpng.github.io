import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ozcanpng.dev',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'tokyo-night',
      wrap: false,
    },
  },
});
