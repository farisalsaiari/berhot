import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    port: 3002,
    strictPort: true,
    proxy: {
      '/api/v1/auth': { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1/users': { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1/tenants': { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1/locations': { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1/business-locations': { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1/partners': { target: 'http://localhost:8080', changeOrigin: true },
      '/uploads': { target: 'http://localhost:8082', changeOrigin: true },
      '/api': { target: 'http://localhost:8082', changeOrigin: true },
    },
  },
  preview: {
    port: 5003,
    strictPort: true,
    proxy: {
      '/api/v1/auth': { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1/users': { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1/tenants': { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1/locations': { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1/business-locations': { target: 'http://localhost:8080', changeOrigin: true },
      '/api/v1/partners': { target: 'http://localhost:8080', changeOrigin: true },
      '/uploads': { target: 'http://localhost:8082', changeOrigin: true },
      '/api': { target: 'http://localhost:8082', changeOrigin: true },
    },
  },
});
