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

const BACKEND_URL = API_HOST ? `http://${API_HOST}/` : 'http://app:3000/api';

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

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [react(), nxViteTsPaths()],
  server: {
    host: true,
    allowedHosts: [
      'nginx',
      'localhost',
      '127.0.0.1',
      'codewit.us',
      'codewit.dev',
    ],
  },

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
