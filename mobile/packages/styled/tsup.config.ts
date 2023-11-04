import { defineConfig } from 'tsup';

export default defineConfig(options => ({
  entryPoints: {
    index: 'src/index.tsx',
  },
  clean: true,
  treeshake: true,
  dts: true,
  format: ['cjs', 'esm'],
  minify: true,
  external: ['react', 'react-native'],
}));
