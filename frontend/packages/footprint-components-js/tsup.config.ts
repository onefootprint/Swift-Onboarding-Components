import { defineConfig } from 'tsup';

const forceFootprintToUseLocal =
  process.env.FORCE_FOOTPRINT_COMPONENTS_JS_TO_USE_LOCAL === 'true';
const currentBranch = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF;
const isVercelPreview = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
const isDevelopment = currentBranch === 'development' && isVercelPreview;
const isPreview = !isDevelopment && isVercelPreview;

const getBranchAsSlug = (branchName?: string) => {
  if (!branchName) return '';
  return branchName.replaceAll('/', '-');
};

const getComponentsUrl = (isLocal: boolean) => {
  if (isLocal) {
    return 'http://localhost:3010';
  }
  if (isDevelopment) {
    return 'https://components.preview.onefootprint.com';
  }
  if (isPreview) {
    const branchAsSlug = getBranchAsSlug(currentBranch);
    return `https://components-git-${branchAsSlug}.preview.onefootprint.com`;
  }
  return 'https://components.onefootprint.com';
};

const getApiUrl = (isLocal: boolean) => {
  if (isLocal) {
    return 'http://localhost:8000';
  }
  if (isDevelopment || isPreview) {
    return 'https://api.dev.onefootprint.com';
  }
  return 'https://api.onefootprint.com';
};

export default defineConfig(options => ({
  entryPoints: {
    'footprint-components-js': 'src/index.ts',
  },
  clean: true,
  treeshake: true,
  dts: true,
  format: ['cjs', 'esm', 'iife'],
  watch: options.watch,
  minify: !options.watch,
  external: ['react', 'react-dom'],
  env: {
    API_BASE_URL: getApiUrl(!!options.watch || forceFootprintToUseLocal),
    COMPONENTS_URL: getComponentsUrl(
      !!options.watch || forceFootprintToUseLocal,
    ),
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
}));
