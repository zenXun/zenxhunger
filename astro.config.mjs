// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import rehypeBookLinker from './src/plugins/rehype-book-linker.mjs';

console.log("DEBUG: ASTRO CONFIG RELOADED " + new Date().toISOString());

// https://astro.build/config
export default defineConfig({
  site: 'https://zenxhunger.com',
  markdown: {
    rehypePlugins: [[rehypeBookLinker, { isProduction: process.env.NODE_ENV === 'production' }]],
  },
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});