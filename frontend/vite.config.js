import { defineConfig, loadEnv } from 'vite';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return { server: { port: 3000, proxy: { '/api': { target: env.BACKEND_URL || 'http://localhost:5000', changeOrigin: true } } } };
});
