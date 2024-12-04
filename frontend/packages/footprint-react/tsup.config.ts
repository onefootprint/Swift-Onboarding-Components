import fs from 'fs/promises';
import { defineConfig } from 'tsup';

export default defineConfig(options => ({
  entryPoints: {
    'footprint-react': 'src/index.ts',
  },
  clean: true,
  treeshake: true,
  dts: true,
  css: true,
  format: ['cjs', 'esm', 'iife'],
  watch: options.watch,
  minify: !options.watch,
  /** Don't bundle these modules */
  external: ['react', 'react-dom', '@onefootprint/footprint-js'],
  /** Always bundle modules matching given patterns */
  noExternal: ['@onefootprint/fetch'],
  env: {
    API_BASE_URL: options.watch ? 'https://api.dev.onefootprint.com' : 'https://api.onefootprint.com',
    NODE_ENV: options.watch ? 'development' : 'production',
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
  async onSuccess() {
    const data = await fs.readFile('./node_modules/@onefootprint/footprint-js/dist/footprint-js.css', 'utf8');

    const destinationFile = './dist/footprint-react.css';
    const cssFile = await fs.readFile(destinationFile, 'utf8');

    const cssContent = cssFile.replace('@import "@onefootprint/footprint-js/dist/footprint-js.css";', data);

    // Append the content to the destination file
    await fs.writeFile(destinationFile, cssContent);
  },
}));
