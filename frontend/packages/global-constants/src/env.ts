const getBranchSlug = (branchName: string) => branchName.toLowerCase().split('/').join('-');

export const IS_VERCEL_PREVIEW = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
export const IS_TEST = process.env.NODE_ENV === 'test';
export const IS_E2E = process.env.IS_E2E === 'true';
export const IS_CI = process.env.CI === 'true';

export const IS_BROWSER = typeof window !== 'undefined';
export const IS_SERVER = typeof window === 'undefined';

export const IS_DEV = process.env.NODE_ENV === 'development';
export const IS_PROD = !IS_DEV;
export const IS_PREVIEW = IS_VERCEL_PREVIEW;

const createGetProjectUrl =
  (options: {
    port: string;
    local?: string;
    previewAlias: string;
    prodAlias: string;
  }) =>
  (env = 'local', branchName?: string) => {
    if (env === 'local') {
      return options.local || `http://localhost:${options.port}`;
    }
    if (env === 'preview' && branchName) {
      if (branchName === 'development') {
        return `https://${options.previewAlias}.preview.onefootprint.com`;
      }
      const branchSlug = getBranchSlug(branchName);
      return `https://${options.previewAlias}-git-${branchSlug}.preview.onefootprint.com`;
    }
    return `https://${options.prodAlias}.onefootprint.com`;
  };

const env = process.env.NEXT_PUBLIC_VERCEL_ENV;
const branchName = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF;

export const DEMO_BASE_URL = createGetProjectUrl({
  port: '3002',
  previewAlias: 'demo',
  prodAlias: 'demo',
})(env, branchName);

export const MY1FP_BASE_URL = createGetProjectUrl({
  port: '3004',
  previewAlias: 'my1fp',
  prodAlias: 'my',
})(env, branchName);

export const DASHBOARD_BASE_URL = createGetProjectUrl({
  port: '3001',
  previewAlias: 'dashboard',
  prodAlias: 'dashboard',
})(env, branchName);

export const HOSTED_BASE_URL = createGetProjectUrl({
  port: '3004',
  previewAlias: 'hosted',
  prodAlias: 'verify',
})(env, branchName);

export const AUTH_BASE_URL = createGetProjectUrl({
  port: '3011',
  previewAlias: 'auth',
  prodAlias: 'auth',
})(env, branchName);

export const HANDOFF_BASE_URL = createGetProjectUrl({
  port: '3005',
  local: process.env.NEXT_PUBLIC_LOCAL_HANDOFF_BASE_URL,
  previewAlias: 'handoff',
  prodAlias: 'handoff',
})(env, branchName);

export const FRONTPAGE_BASE_URL = createGetProjectUrl({
  port: '3003',
  previewAlias: 'frontpage',
  prodAlias: 'frontpage',
})(env, branchName);

export const EMBEDDED_COMPONENTS_BASE_URL = createGetProjectUrl({
  port: '3010',
  previewAlias: 'components',
  prodAlias: 'components',
})(env, branchName);

export const DOCS_BASE_URL = createGetProjectUrl({
  port: '3009',
  previewAlias: 'docs',
  prodAlias: 'docs',
})(env, branchName);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const LAUNCH_DARKLY_CLIENT_SIDE_ID_PROD = process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID_PROD;
const LAUNCH_DARKLY_CLIENT_SIDE_ID_PREVIEW = process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID_PREVIEW;
const LAUNCH_DARKLY_CLIENT_SIDE_ID_DEV = process.env.NEXT_PUBLIC_LAUNCH_DARKLY_CLIENT_SIDE_ID_DEV;

const getLaunchDarklyClientSideId = () => {
  const baseUrl = API_BASE_URL ?? '';
  if (baseUrl.includes('localhost')) {
    return LAUNCH_DARKLY_CLIENT_SIDE_ID_DEV ?? '';
  }
  if (baseUrl?.includes('preview')) {
    return LAUNCH_DARKLY_CLIENT_SIDE_ID_PREVIEW ?? '';
  }
  return LAUNCH_DARKLY_CLIENT_SIDE_ID_PROD ?? '';
};

export const LAUNCH_DARKLY_CLIENT_SIDE_ID = getLaunchDarklyClientSideId();
