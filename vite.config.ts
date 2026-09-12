import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Jalur aset dibuat relatif supaya aplikasi tetap jalan baik di akar domain
  // maupun saat diakses dari subfolder (mis. /~plakatka/).
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    // Saat development lokal, request /api diteruskan ke server PHP.
    // Jalankan backend dari akar proyek dengan: php -S localhost:8000
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
