/* global process */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Tombol darurat PWA: `PWA_SELF_DESTROY=true npm run build` menghasilkan service worker yang mencopot dirinya
// dari semua perangkat, dan aplikasi berhenti mendaftarkannya lagi (tanpa ini akan terjadi loop reload).
const PWA_KILL = process.env.PWA_SELF_DESTROY === 'true'

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_PWA_KILL': JSON.stringify(PWA_KILL ? 'true' : ''),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 'prompt': versi baru tidak langsung menimpa halaman yang sedang dipakai (mencegah
      // form yang sedang diisi hilang); pengguna diberi tombol "Muat Ulang" (lihat PwaUpdatePrompt).
      registerType: 'prompt',
      injectRegister: false,
      selfDestroying: PWA_KILL,
      manifest: {
        id: '/',
        name: 'AmanPoll - Aduan & Pemeliharaan Alat',
        short_name: 'AmanPoll',
        description: 'Aplikasi aduan, inventaris, dan pemeliharaan alat medis untuk User Ruangan dan Teknisi.',
        lang: 'id',
        dir: 'ltr',
        start_url: '/mobile/dashboard?source=pwa',
        scope: '/',
        display: 'standalone',
        background_color: '#EDE9FE',
        theme_color: '#6C5DD3',
        categories: ['business', 'productivity', 'medical'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Scan QR Alat', short_name: 'Scan', url: '/mobile/scan?source=shortcut', icons: [{ src: '/icons/shortcut-96.png', sizes: '96x96', type: 'image/png' }] },
          { name: 'Aduan', short_name: 'Aduan', url: '/mobile/aduan?source=shortcut', icons: [{ src: '/icons/shortcut-96.png', sizes: '96x96', type: 'image/png' }] },
          { name: 'Notifikasi', short_name: 'Notifikasi', url: '/mobile/notifikasi?source=shortcut', icons: [{ src: '/icons/shortcut-96.png', sizes: '96x96', type: 'image/png' }] },
        ],
      },
      workbox: {
        // Seluruh aplikasi (+/- 2 MB) disimpan agar terbuka cepat dan tetap tampil tanpa sinyal.
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2,webmanifest}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        // Rute SPA (mis. /mobile/aduan/12) dilayani dari index.html; API, berkas unggahan,
        // dan tautan bypass maintenance tidak boleh dialihkan ke sana.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/storage\//, /^\/bypass\//],
        runtimeCaching: [
          // Data API bersifat pribadi dan cepat berubah: selalu ke jaringan, tidak pernah disimpan.
          { urlPattern: ({ url }) => url.pathname.startsWith('/api/'), handler: 'NetworkOnly' },
          // Foto alat/aduan: tampil dari cache dulu, diperbarui di latar belakang.
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/storage/'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'foto-unggahan', expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 14 }, cacheableResponse: { statuses: [0, 200] } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://amanpoll.rsudgemolong.com',
        // target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - split large libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          'ui-vendor': ['lucide-react'],
          // Desktop features
          'desktop-inventaris': [
            './src/features/desktop/inventaris/MasterKategori.jsx',
            './src/features/desktop/inventaris/MasterNamaAlat.jsx',
            './src/features/desktop/inventaris/InventarisList.jsx',
            './src/features/desktop/inventaris/InventarisForm.jsx',
            './src/features/desktop/inventaris/InventarisDetail.jsx',
          ],
          'desktop-master': [
            './src/features/desktop/master-data/divisi/MasterDivisi.jsx',
            './src/features/desktop/master-data/ruangan/MasterRuangan.jsx',
            './src/features/desktop/master-data/user/MasterUser.jsx',
          ],
          'desktop-reports': [
            './src/features/desktop/report/ReportAduan.jsx',
            './src/features/desktop/report/DetailReportAduan.jsx',
            './src/features/desktop/report/ReportPemeliharaan.jsx',
            './src/features/desktop/report/DetailReportPemeliharaan.jsx',
          ],
          // Mobile features
          'mobile-features': [
            './src/features/mobile/dashboard/MobileDashboard.jsx',
            './src/features/mobile/aduan/MobileAduan.jsx',
            './src/features/mobile/inventaris/MobileInventaris.jsx',
            './src/features/mobile/pemeliharaan/MobilePemeliharaan.jsx',
          ],
        }
      }
    },
    chunkSizeWarningLimit: 600, // Increase limit to 600kb
  }
})

