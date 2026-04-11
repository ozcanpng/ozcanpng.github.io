import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ozcanpng.dev',
  markdown: {
    shikiConfig: {
      theme: 'tokyo-night',
    },
  },
});
