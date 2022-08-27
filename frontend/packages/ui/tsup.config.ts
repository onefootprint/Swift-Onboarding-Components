import { defineConfig } from 'tsup';

export default defineConfig({
  treeshake: true,
  external: [
    'react',
    'react-dom',
    'polished',
    'styled-components',
    'icons',
    'themes',
  ],
});
