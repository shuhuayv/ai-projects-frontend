import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 开发期 dev proxy：前端统一以相对路径 /api/* 发起请求，
// 由 Vite 按前缀转发到两个本地后端，规避 CORS、无需后端额外配置。
//
//   /api/rag       -> ai-knowledge-rag  (http://localhost:8080)
//   /api/documents -> ai-knowledge-rag  (http://localhost:8080)
//   /api/search    -> ai-knowledge-rag  (http://localhost:8080)
//   /api/repos     -> ai-code-reviewer  (http://localhost:8081)
//   /api/reviews   -> ai-code-reviewer  (http://localhost:8081)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/rag': 'http://localhost:8080',
      '/api/documents': 'http://localhost:8080',
      '/api/search': 'http://localhost:8080',
      '/api/repos': 'http://localhost:8081',
      '/api/reviews': 'http://localhost:8081',
    },
  },
});
