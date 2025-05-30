import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      bundler: 'vite',
      webServerCommands: {
        default: 'nx run client:serve',
        production: 'nx run client:preview',
      },
      ciWebServerCommand: 'nx run client:serve-static',
    }),
    baseUrl: 'http://localhost:3001',
    viewportWidth: 1440, 
    viewportHeight: 900,  
  },
});
