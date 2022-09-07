import { defineConfig } from 'tsup';

const getEnv = (watch: string | boolean | (string | boolean)[] | undefined) => {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV) {
    return process.env.NEXT_PUBLIC_VERCEL_ENV;
  }
  return watch ? 'local' : 'production';
};

const getCommitRef = () => {
  if (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF) {
    return process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF;
  }
  return '';
};

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
    NEXT_PUBLIC_VERCEL_ENV: getEnv(config.watch),
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF: getCommitRef(),
  },
}));
