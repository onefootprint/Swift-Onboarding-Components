import { defineConfig } from 'tsup';

export default defineConfig({
  treeshake: true,
  external: ['axios', 'axios-case-converter'],
});
