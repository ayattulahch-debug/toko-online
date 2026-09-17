import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  // Backend dev diambil dari hosting. Isi `.env.local` (tidak ikut ter-commit):
  //   VITE_API_TARGET=https://nirvaya.zenhosta.com
  //   VITE_API_PREFIX=/~plakatka
  //
  // Situs sudah bisa diakses lewat https://elaseracrylic.my.id, tapi sertifikat
  // domain itu masih self-signed sehingga request dari Node ditolak. Setelah
  // AutoSSL dijalankan di cPanel, target bisa diganti jadi:
  //   VITE_API_TARGET=https://elaseracrylic.my.id
  //   VITE_API_PREFIX=
  const apiTarget = env.VITE_API_TARGET || 'http://209.182.237.7'
  const apiPrefix = env.VITE_API_PREFIX ?? '/~plakatka'

  return {
    // Jalur aset dibuat relatif supaya aplikasi tetap jalan baik di akar domain
    // maupun saat diakses dari subfolder (mis. /~plakatka/).
    base: './',
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        // Request /api dan /uploads diteruskan ke hosting, sehingga di localhost
        // data produk dan foto yang sudah diunggah tetap tampil.
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => `${apiPrefix}${path}`,
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => `${apiPrefix}${path}`,
        },
      },
    },
  }
})
