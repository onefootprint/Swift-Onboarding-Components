import { defineConfig } from 'tsup';

export default defineConfig(config => ({
  dts: true,
  format: config.watch ? ['esm', 'cjs'] : ['esm', 'cjs', 'iife'],
  minify: !config.watch,
  clean: !config.watch,
  entry: {
    'footprint-js': 'src/index.ts',
  },
  outExtension({ format }) {
    if (format === 'iife') {
      return {
        js: `.umd.js`,
      };
    }
    return {
      js: `.${format}.js`,
    };
  },
  env: {
    NODE_ENV: 'production',
    NEXT_PUBLIC_VERCEL_ENV: '',
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF: '',
  },
}));
