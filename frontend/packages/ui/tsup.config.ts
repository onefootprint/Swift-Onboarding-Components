import { defineConfig } from 'tsup';

export default defineConfig({
  external: [
    'react',
    'react-dom',
    'polished',
    'styled-components',
    '@onefootprint/icons',
    '@onefootprint/themes',
  ],
});
