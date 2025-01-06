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
          secure: false, // Necessário para certificados auto-assinados
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/ws': {
          target: env.VITE_API_URL || 'https://91.108.125.149:5000',
          ws: true,
          changeOrigin: true,
          secure: false,
        },
      },
      historyApiFallback: true, // Adiciona suporte ao history API fallback
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@headlessui/react'],
            icons: ['@heroicons/react'],
            charts: ['recharts'],
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'flavicon.png') {
              return 'flavicon.png';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      assetsDir: '',
      copyPublicDir: true,
    },
  };
});
