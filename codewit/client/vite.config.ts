/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const API_PORT = process.env.API_PORT
const API_HOST = process.env.API_HOST
if (!API_HOST) {
  console.log('BACKEND_URL is not set');
}

// const BACKEND_URL = `http://${API_HOST}:${API_PORT}/api`;
// if API_HOST is not set, use http://app:3000

const BACKEND_URL = API_HOST ? `https://${API_HOST}/` : 'http://app:3000/api';

export default defineConfig(({ mode }) => ({
  root: __dirname,
  cacheDir: '../node_modules/.vite/client',
  base: mode === 'production' ? './' : '/',
  define: {
    'import.meta.env.VITE_KEY': JSON.stringify(process.env.YT_KEY),
    'import.meta.env.VITE_CHANNEL_ID': JSON.stringify(
      process.env.YT_CHANNEL_ID
    ),
  },
  server: {
    port: 3001,
    host: 'localhost',
    allowedHosts: [
      'codewit-api-711de55249e1.herokuapp.com',
      'codewit-dev-c2a3ef30f1fe.herokuapp.com',
      'localhost'
    ],
    proxy: {
      '/demos': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      '/exercises': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      '/modules': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      '/resources': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      '/courses': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      '/oauth2': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      '/users': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      '/attempts': {
        target: BACKEND_URL,
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
}));
