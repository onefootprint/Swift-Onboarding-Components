const getBranchSlug = (branchName: string) =>
  branchName.toLowerCase().split('/').join('-');

const getDemoUrl = (env = 'local', branchName?: string) => {
  if (env === 'local') {
    return 'http://localhost:3002';
  }
  if (env === 'preview' && branchName) {
    if (branchName === 'development') {
      return `https://demo.preview.onefootprint.com`;
    }
    const branchSlug = getBranchSlug(branchName);
    return `https://demo-git-${branchSlug}.preview.onefootprint.com`;
  }
  return 'https://demo.onefootprint.com';
};

const getHandoffUrl = (env = 'local', branchName?: string) => {
  if (env === 'local') {
    return (
      process.env.NEXT_PUBLIC_LOCAL_HANDOFF_BASE_URL || 'http://localhost:3005'
    );
  }
  if (env === 'preview' && branchName) {
    if (branchName === 'development') {
      return `https://handoff.preview.onefootprint.com`;
    }
    const branchSlug = getBranchSlug(branchName);
    return `https://handoff-git-${branchSlug}.preview.onefootprint.com`;
  }
  return 'https://handoff.onefootprint.com';
};

const getMy1fpUrl = (env = 'local', branchName?: string) => {
  if (env === 'local') {
    return 'http://localhost:3004';
  }
  if (env === 'preview' && branchName) {
    if (branchName === 'development') {
      return `https://my1fp.preview.onefootprint.com`;
    }
    const branchSlug = getBranchSlug(branchName);
    return `https://my1fp-git-${branchSlug}.preview.onefootprint.com`;
  }
  return 'https://my.onefootprint.com';
};

export const IS_BROWSER = typeof window !== 'undefined';
export const IS_SERVER = typeof window === 'undefined';
export const IS_DEV = process.env.NODE_ENV === 'development';
export const IS_PROD = !IS_DEV;

export const HANDOFF_BASE_URL = getHandoffUrl(
  process.env.NEXT_PUBLIC_VERCEL_ENV,
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF,
);

export const MY1FP_URL = getMy1fpUrl(
  process.env.NEXT_PUBLIC_VERCEL_ENV,
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF,
);

export const DEMO_BASE_URL = getDemoUrl(
  process.env.NEXT_PUBLIC_VERCEL_ENV,
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF,
);
