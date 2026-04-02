import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'MediFind Zimbabwe',
        short_name: 'MediFind',
        description: 'Find available medicines at pharmacies near you in Zimbabwe',
        theme_color: '#028090',
        background_color: '#F8FAFB',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/favicon.svg', sizes: '512x512', type: 'image/svg+xml' },
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/localhost:3000\/api\/medicines\/popular/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'popular-medicines', expiration: { maxAgeSeconds: 60 * 60 } },
          },
          {
            urlPattern: /^https?:\/\/localhost:3000\/api\/medicines\/search/,
            handler: 'NetworkFirst',
            options: { cacheName: 'search-results', expiration: { maxAgeSeconds: 5 * 60 } },
          },
          {
            urlPattern: /^https?:\/\/localhost:3000\/api\/pharmacies/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'pharmacies', expiration: { maxAgeSeconds: 15 * 60 } },
          },
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'map-tiles', expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 } },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: { '@': '/src' },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          leaflet: ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
});
