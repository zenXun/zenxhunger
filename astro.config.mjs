// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import rehypeBookLinker from './src/plugins/rehype-book-linker.mjs';

console.log("DEBUG: ASTRO CONFIG LOADED");

// https://astro.build/config
export default defineConfig({
  site: 'https://zenxhunger.com',
  markdown: {
    rehypePlugins: [rehypeBookLinker],
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