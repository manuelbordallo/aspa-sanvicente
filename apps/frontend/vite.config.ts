import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild', // Use esbuild for faster builds, switch to 'terser' for better compression
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          'lit-core': ['lit'],
          'lit-router': ['@lit-labs/router'],
          'lit-context': ['@lit/context'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 4173,
    open: true,
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(
      process.env.npm_package_version
    ),
  },
});
