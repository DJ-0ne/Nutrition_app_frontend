import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      manifestFilename: 'manifest.json',

      includeAssets: ['favicon.ico','logo.png', 'abcdelogo-144.png', 'abcdelogo-192.png', 'client-512.png', 'client-maskable-512.png', 'screenshot-desktop.png', 'screenshot-mobile.png', 'apple-touch-icon.png'],

      manifest: {
        name: 'ABCDE SMART DIET APP',
        short_name: 'ABCDE SMART DIET',
        description: 'Track your nutrition and meals',
        theme_color: '#ffffff',
        text_color: '#000000',
        display: 'standalone',
        orientation: 'portrait', 
        scope: '/',
        start_url: '/',
        id: '/?homescreen=1',
        categories: ['health', 'fitness', 'food'],
        icons: [
          {
            src: 'logo.png',
            sizes: '500x500',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'logo.png',
            sizes: '500x500',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'logo.png',
            sizes: '500x500',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'abcdelogo-144.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshot-desktop.png',
            sizes: '1890x967',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Desktop View'
          },
          {
            src: 'screenshot-mobile.png',
            sizes: '967x1890',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Mobile View'
          }
        ],
        shortcuts: [
          {
            name: 'Log Meal',
            short_name: 'Log',
            description: 'Quickly log a meal',
            url: '/user/log-meal',
            icons: [{ src: 'logo.png', sizes: '192x192', type: 'image/png' }]
          },
        ]
      },

      workbox: {
        globPatterns: process.env.NODE_ENV === 'production'
          ? ['**/*.{js,css,html,ico,png,svg,woff2,jpg,jpeg}']
          : [],

        runtimeCaching: [
          {
            urlPattern: /^https:\/\/a\.nutristrategist\.africa\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }
            }
          }
        ]
      },

      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],

  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL?.replace('/api', '') || 'https://a.nutristrategist.africa',
        changeOrigin: true,
      }
    }
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  define: {
    'process.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'https://a.nutristrategist.africa/api'
    )
  }
})