import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { terser } from 'rollup-plugin-terser';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
      plugins: [
        terser({
          format: {
            comments: false,
          },
          compress: {
            drop_console: false, // Temporariamente habilitando console logs para debug
            drop_debugger: true,
            pure_funcs: [],
          },
          mangle: {
            properties: false, // Desabilitando mangle de propriedades para evitar problemas
          },
        }),
      ],
    },
    minify: 'terser',
    sourcemap: true, // Habilitando sourcemap para debug
  },
  server: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
