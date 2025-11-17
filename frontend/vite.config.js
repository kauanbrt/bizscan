import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Compressão gzip dos arquivos estáticos
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // Só comprime arquivos maiores que 1KB
      deleteOriginFile: false,
    }),
    // Compressão brotli (opcional, melhor compressão)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
    }),
  ],
  build: {
    // Otimizações adicionais
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log em produção
      },
    },
  },
})
