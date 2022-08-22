import { defineConfig } from 'tsup';

export default defineConfig({
  treeshake: true,
  external: ['react', 'react-dom', 'react-i18next', 'ui', 'request'],
});
