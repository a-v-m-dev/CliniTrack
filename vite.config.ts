import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),

    // ✅ PWA Plugin
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'CliniTrack',
        short_name: 'clinitrack',
        description: 'React + Vite + PouchDB PWA',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0d6efd',
        icons: [
          {
            src: 'clinitrack-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'clinitrack-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },

      // 🔹 Offline behavior
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'script' ||
              request.destination === 'style' ||
              request.destination === 'worker',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets',
            },
          },
        ],
      },

      devOptions: {
        enabled: true, // 🔥 Allows PWA testing in dev
      },
    }),
  ],

  resolve: {
    alias: {
      util: 'rollup-plugin-node-polyfills/polyfills/util',
      events: 'rollup-plugin-node-polyfills/polyfills/events',
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer',
      process: 'rollup-plugin-node-polyfills/polyfills/process-es6',
    },
  },

  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis', // Required by PouchDB
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },

  server: {
    port: 5173,
  },

  build: {
    outDir: 'build',
  },
});