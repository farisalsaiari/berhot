import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3004,
    strictPort: true,
    proxy: {
      '/api/v1/auth': { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1/users': { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1/tenants': { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1/locations': { target: 'http://localhost:8080', changeOrigin: true },
      '/api': { target: 'http://localhost:8081', changeOrigin: true },
    },
  },
  preview: {
    port: 5005,
    strictPort: true,
    proxy: {
      '/api/v1/auth': { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1/users': { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1/tenants': { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1/locations': { target: 'http://localhost:8080', changeOrigin: true },
      '/api': { target: 'http://localhost:8081', changeOrigin: true },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
        },
      },
    },
  },
});
