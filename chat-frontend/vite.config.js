import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: {},
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 스프링 부트 포트
        changeOrigin: true,
        ws: true,
      },
      '/files': {
        target: 'http://localhost:8080',   // 정적 파일도 프록시
        changeOrigin: true,
      },
    },
  },
});
