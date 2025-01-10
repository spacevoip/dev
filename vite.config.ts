import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: './',
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
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
          rewrite: (path) => path.replace(/^\/ws/, ''),
        }
      },
      historyApiFallback: true,
    },
    preview: {
      port: 4173,
      host: true,
      strictPort: true,
      historyApiFallback: true,
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@headlessui/react', '@heroicons/react'],
            charts: ['recharts', 'chart.js', 'react-chartjs-2'],
          }
        }
      },
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true
      },
      chunkSizeWarningLimit: 1500,
      sourcemap: true,
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020',
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
