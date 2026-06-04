/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const API_PORT = process.env.API_PORT;
const API_HOST = process.env.API_HOST;
const API_TARGET = API_HOST
  ? `http://${API_HOST}${API_PORT ? `:${API_PORT}` : ''}`
  : 'http://localhost:3000';
const CODEEVAL_TARGET = API_HOST
  ? `http://${API_HOST}${API_PORT ? `:${API_PORT}` : ''}`
  : 'http://localhost:3002';
const usingGatewayProxy = Boolean(API_HOST);

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
    port: 3001,
    allowedHosts: [
      'nginx',
      'localhost',
      '127.0.0.1',
      'codewit.us',
      'codewit.dev',
    ],
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        rewrite: usingGatewayProxy ? undefined : (path) => path.replace(/^\/api/, ''),
      },
      '/codeeval': {
        target: CODEEVAL_TARGET,
        changeOrigin: true,
        rewrite: usingGatewayProxy ? undefined : (path) => path.replace(/^\/codeeval/, ''),
      },
    },
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
