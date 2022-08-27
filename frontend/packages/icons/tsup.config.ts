import { defineConfig } from 'tsup';

export default defineConfig({
  treeshake: true,
  external: ['react', 'react-dom', 'styled-components', 'themes'],
});
