import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'https://91.108.125.149:5000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/ws': {
          target: env.VITE_API_URL || 'https://91.108.125.149:5000',
          ws: true,
          changeOrigin: true,
          secure: false,
        },
      },
      historyApiFallback: true,
    },
    preview: {
      port: 4173,
      historyApiFallback: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@headlessui/react'],
            icons: ['@heroicons/react'],
            charts: ['recharts'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  };
});
