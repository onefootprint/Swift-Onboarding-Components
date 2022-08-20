import { defineConfig } from 'tsup';

export default defineConfig({
  external: ['axios', 'axios-case-converter'],
});
