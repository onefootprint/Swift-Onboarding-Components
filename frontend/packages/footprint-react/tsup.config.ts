import { defineConfig } from 'tsup';

export default defineConfig(options => ({
  entryPoints: {
    'footprint-react': 'src/index.ts',
  },
  clean: true,
  treeshake: true,
  dts: true,
  format: ['cjs', 'esm', 'iife'],
  watch: options.watch,
  minify: !options.watch,
  external: ['react', 'react-dom', '@onefootprint/footprint-js'],
  outExtension({ format }) {
    if (format === 'cjs') {
      return {
        js: '.cjs',
      };
    }
    if (format === 'iife') {
      return {
        js: '.umd.js',
      };
    }
    return {
      js: '.js',
    };
  },
}));
