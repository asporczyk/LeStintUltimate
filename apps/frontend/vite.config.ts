import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'api': path.resolve(__dirname, './src/api'),
      components: path.resolve(__dirname, './src/components'),
      pages: path.resolve(__dirname, './src/pages'),
      assets: path.resolve(__dirname, './src/assets'),
      types: path.resolve(__dirname, './src/types'),
      styles: path.resolve(__dirname, './src/styles'),
      i18n: path.resolve(__dirname, './src/i18n'),
      utils: path.resolve(__dirname, './src/utils'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  publicDir: 'public',
  // PORT lets a second dev server run next to one already on 5173.
  server: {
    port: Number(process.env.PORT) || 5173,
  },
})
