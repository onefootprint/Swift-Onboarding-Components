import { defineConfig } from 'tsup';

export default defineConfig(options => ({
  entryPoints: { 'footprint-components': 'src/index.ts' },
  clean: true,
  treeshake: true,
  dts: true,
  format: ['cjs', 'esm'],
  watch: options.watch,
  minify: !options.watch,
  external: ['react', 'react-dom'],
  env: {
    API_BASE_URL: 'https://api.dev.onefootprint.com',
    NODE_ENV: options.watch ? 'development' : 'production',
  },
}));
