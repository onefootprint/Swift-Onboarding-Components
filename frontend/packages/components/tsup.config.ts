import { defineConfig } from 'tsup';

export default defineConfig(options => {
  const isDev = !!options.watch;

  return {
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
      NODE_ENV: isDev ? 'development' : 'production',
      HANDOFF_BASE_URL: isDev
        ? 'https://handoff.preview.onefootprint.com'
        : 'https://handoff.onefootprint.com',
    },
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
  };
});
