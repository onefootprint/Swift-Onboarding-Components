const getBiometricUrl = (env = 'local', branchName?: string) => {
  if (env === 'local') {
    return (
      process.env.NEXT_PUBLIC_LOCAL_BIOMETRIC_BASE_URL ||
      'http://localhost:3005/'
    );
  }
  if (env === 'development') {
    return 'https://biometric.preview.onefootprint.com';
  }
  if (env === 'preview' && branchName) {
    const branchSlug = branchName.toLowerCase().replaceAll('/', '-');
    return `https://biometric-git-${branchSlug}.preview.onefootprint.com`;
  }
  return 'https://biometric.onefootprint.com';
};

const getMy1fpUrl = (env = 'local', branchName?: string) => {
  if (env === 'local') {
    return 'http://localhost:3004/';
  }
  if (env === 'development') {
    return 'https://my1fp.preview.onefootprint.com';
  }
  if (env === 'preview' && branchName) {
    const branchSlug = branchName.toLowerCase().replaceAll('/', '-');
    return `https://my1fp-git-${branchSlug}.preview.onefootprint.com`;
  }
  return 'https://my.onefootprint.com';
};

export const IS_BROWSER = typeof window !== 'undefined';
export const IS_SERVER = typeof window === 'undefined';
export const IS_DEV = process.env.NODE_ENV === 'development';
export const IS_PROD = !IS_DEV;

export const BIOMETRIC_BASE_URL = getBiometricUrl(
  process.env.NEXT_PUBLIC_VERCEL_ENV,
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF,
);

export const MY1FP_URL = getMy1fpUrl(
  process.env.NEXT_PUBLIC_VERCEL_ENV,
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF,
);
