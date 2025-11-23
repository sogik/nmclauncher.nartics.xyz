import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://nmclauncher.nartics.xyz',
  image: {
    domains: ['raw.githubusercontent.com'],
  },
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  vite: {
    build: {
      cssMinify: true,
      minify: 'esbuild',
    },
  },
});