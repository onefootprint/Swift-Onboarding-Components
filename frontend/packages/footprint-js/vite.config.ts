import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => ({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FootprintJS',
      // the proper extensions will be added
      fileName: 'footprint-js',
    },
    rollupOptions: {
      external: [],
      output: {},
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  define: {
    'url:preview': `https://bifrost-git-${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF}.preview.onefootprint.com`,
    'url:local': 'http://localhost:3000/',
    'url:dev': 'https://id.preview.onefootprint.com',
    'url:prod': 'https://id.onefootprint.com',
    "process.env.NODE_ENV !== 'production'": mode !== 'production',
    'process.env.IS_LOCAL': mode === 'development',
    'process.env.IS_PROD': mode === 'production',
    'process.env.IS_VERCEL_ENV_DEV':
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF === 'development' &&
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview',
    'process.env.IS_VERCEL_ENV_PREV':
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF !== 'development' &&
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview',
  },
}));
