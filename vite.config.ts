import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [wasm()],
  build: {
    assetsInlineLimit: 0,
    target: 'esnext',
    rollupOptions: {
      treeshake: false,
    }
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    exclude: ['@dimforge/rapier2d'],
  },
}); 