import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://amanpoll.com',
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

