import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

const isBuild = process.argv.includes('build');

export default defineConfig({
  site: import.meta.env.SITE || 'https://yourdomain.com',
  output: 'static',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),

  image: {
    layout: 'constrained',
  },

  integrations: [
    react(),
    mdx(),
    sitemap(),
  ],

  server: {
    host: true,
    allowedHosts: true,
  },

  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: true,
    },
    ssr: {
      resolve: {
        // Force react-dom/server to use the edge build (no MessageChannel dependency)
        // The default @astrojs/cloudflare alias points to server.browser which breaks on workerd
        conditions: ['workerd', 'worker', 'browser'],
      },
    },
    resolve: {
      // The edge alias is required for Cloudflare Workers but breaks Vite's dev server
      // (server.edge.js uses CommonJS require() which ESM module runner can't handle)
      alias: isBuild
        ? { 'react-dom/server': 'react-dom/server.edge' }
        : {},
    },
  },

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
