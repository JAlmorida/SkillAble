import path from "path"
import { fileURLToPath } from "url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from 'vite-plugin-pwa'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true 
      },
      manifest: {
        name: 'SKILLABLE - Learn & Grow',
        short_name: 'SKILLABLE',
        description: 'Professional learning platform with courses and interactive content',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        categories: ['education', 'productivity'],
        screenshots: [
          {
            src: '512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: '512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^http:\/\/localhost:8080\/api\/v1\/courses\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'skillable-courses',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          // Optionally, add more patterns for videos/materials if needed
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})