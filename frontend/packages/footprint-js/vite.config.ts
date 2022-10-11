import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const getEnv = (isDev: boolean) => {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV) {
    return process.env.NEXT_PUBLIC_VERCEL_ENV;
  }
  return isDev ? 'local' : 'production';
};

const getCommitRef = () => {
  if (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF) {
    return process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF;
  }
  return '';
};

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';

  return {
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
      NODE_ENV: 'production',
      NEXT_PUBLIC_VERCEL_ENV: getEnv(isDev),
      NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF: getCommitRef(),
    },
  };
});
