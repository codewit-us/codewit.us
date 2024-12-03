/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export default defineConfig({
  root: __dirname,
  cacheDir: '../node_modules/.vite/client',
  define: {
    'import.meta.env.VITE_KEY': JSON.stringify(process.env.YT_KEY),
    'import.meta.env.VITE_CHANNEL_ID': JSON.stringify(
      process.env.YT_CHANNEL_ID
    ),
  },
  server: {
    port: 3001,
    host: 'localhost',
    proxy: {
      '/demos': {
        target: 'http://nginx:80',
        changeOrigin: true,
      },
      '/exercises': {
        target: 'http://nginx:80',
        changeOrigin: true,
      },
      '/modules': {
        target: 'http://nginx:80',
        changeOrigin: true,
      },
      '/resources': {
        target: 'http://nginx:80',
        changeOrigin: true,
      },
      '/courses': {
        target: 'http://nginx:80',
        changeOrigin: true,
      },
      '/oauth2': {
        target: 'http://nginx:80',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://nginx:80',
        changeOrigin: true,
      },
      '/attempts': {
        target: 'http://nginx:80',
        changeOrigin: true,
      },
    },
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [react(), nxViteTsPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  build: {
    outDir: '../dist/client',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  test: {
    globals: true,
    cache: {
      dir: '../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    reporters: ['default'],
    coverage: {
      reportsDirectory: '../coverage/client',
      provider: 'v8',
    },
    alias: [
      {
        find: /^monaco-editor$/,
        replacement:
          __dirname +
          '../../node_modules/monaco-editor/esm/vs/editor/editor.api',
      },
    ],
  },
});
