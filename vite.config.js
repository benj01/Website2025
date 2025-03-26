import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  root: 'src',
  publicDir: '../assets',
  base: './',
  server: {
    port: 5173
  },
  plugins: [
    wasm(),
    topLevelAwait()
  ],
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext'
  }
}); 