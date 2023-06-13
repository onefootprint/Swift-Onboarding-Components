import { defineConfig } from 'tsup';

export default defineConfig(options => ({
  entryPoints: {
    'footprint-expo': 'src/index.ts',
  },
  clean: true,
  treeshake: true,
  dts: true,
  format: ['cjs', 'esm'],
  watch: options.watch,
  minify: !options.watch,
  external: ['react', 'react-dom', 'expo'],
}));
