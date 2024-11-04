import { defineConfig } from 'tsup';

import { version } from './package.json';

const isE2E = process.env.IS_E2E === 'true';
const forceFootprintToUseLocal = process.env.FORCE_FOOTPRINT_JS_TO_USE_LOCAL === 'true';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const currentBranch = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF;
const isVercelPreview = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
const isDevelopment = currentBranch === 'development' && isVercelPreview;
const isPreview = !isDevelopment && isVercelPreview;

const getBranchAsSlug = (branchName?: string) => {
  if (!branchName) return '';
  return branchName.replaceAll('/', '-');
};

const isProd = (isLocal: boolean) => !(isE2E || isLocal || isDevelopment || isPreview);

const getBifrostUrl = (isLocal: boolean): string => {
  if (isE2E || isLocal) {
    return 'http://localhost:3000';
  }
  if (isDevelopment) {
    return 'https://id.preview.onefootprint.com';
  }
  if (isPreview) {
    const branchAsSlug = getBranchAsSlug(currentBranch);
    return `https://bifrost-git-${branchAsSlug}.preview.onefootprint.com`;
  }
  return 'https://id.onefootprint.com';
};

const getBifrostFallbackURL = (isLocal: boolean) => {
  return isProd(isLocal) ? 'https://id2.onefootprint.com' : getBifrostUrl(isLocal);
};

const getAuthUrl = (isLocal: boolean): string => {
  if (isE2E || isLocal) {
    return 'http://localhost:3011';
  }
  if (isDevelopment) {
    return 'https://auth.preview.onefootprint.com';
  }
  if (isPreview) {
    const branchAsSlug = getBranchAsSlug(currentBranch);
    return `https://auth-git-${branchAsSlug}.preview.onefootprint.com`;
  }
  return 'https://auth.onefootprint.com';
};

const getAuthFallbackURL = (isLocal: boolean) => {
  return isProd(isLocal) ? 'https://auth2.onefootprint.com' : getAuthUrl(isLocal);
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

const getComponentsFallbackURL = (isLocal: boolean) => {
  return isProd(isLocal) ? 'https://components2.onefootprint.com' : getComponentsUrl(isLocal);
};

const getApiUrl = (isLocal: boolean): string => {
  return isProd(isLocal) ? 'https://api.onefootprint.com' : 'https://api.dev.onefootprint.com';
};

export default defineConfig(options => ({
  entryPoints: { 'footprint-js': 'src/index.ts' },
  clean: true,
  treeshake: true,
  dts: true,
  format: ['cjs', 'esm', 'iife'],
  watch: options.watch,
  minify: !options.watch,
  /** Always bundle modules matching given patterns */
  noExternal: ['@onefootprint/dev-tools'],
  env: {
    API_BASE_URL: apiBaseUrl || getApiUrl(!!options.watch || forceFootprintToUseLocal),
    BIFROST_URL: getBifrostUrl(!!options.watch || forceFootprintToUseLocal),
    BIFROST_FALLBACK_URL: getBifrostFallbackURL(!!options.watch || forceFootprintToUseLocal),
    AUTH_URL: getAuthUrl(!!options.watch || forceFootprintToUseLocal),
    AUTH_FALLBACK_URL: getAuthFallbackURL(!!options.watch || forceFootprintToUseLocal),
    COMPONENTS_URL: getComponentsUrl(!!options.watch || forceFootprintToUseLocal),
    COMPONENTS_FALLBACK_URL: getComponentsFallbackURL(!!options.watch || forceFootprintToUseLocal),
    NODE_ENV: options.watch ? 'development' : 'production',
    SDK_VERSION: JSON.stringify(version || ''),
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
