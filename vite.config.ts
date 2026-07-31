import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  server: {
    port: 3000,
    host: true,
    open: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '109.69.22.155',
      '45.146.164.123',
      'dynamikaawms.ru'
    ]
  }
})