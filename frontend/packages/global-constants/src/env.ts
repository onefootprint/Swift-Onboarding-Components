const getBranchSlug = (branchName: string) =>
  branchName.toLowerCase().split('/').join('-');

const IS_VERCEL_PREVIEW = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';

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

export const HANDOFF_BASE_URL = createGetProjectUrl({
  port: '3005',
  local: process.env.NEXT_PUBLIC_LOCAL_HANDOFF_BASE_URL,
  previewAlias: 'handoff',
  prodAlias: 'handoff',
})(env, branchName);
