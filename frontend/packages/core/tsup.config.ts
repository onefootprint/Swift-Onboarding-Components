import { defineConfig } from 'tsup';

export default defineConfig(options => ({
  entryPoints: { 'footprint-core': 'src/index.ts' },
  clean: true,
  treeshake: true,
  dts: true,
  format: ['cjs', 'esm'],
  watch: options.watch,
  minify: !options.watch,
  external: ['react', 'react-dom'],
  env: {
    NODE_ENV: options.watch ? 'development' : 'production',
  },
}));
