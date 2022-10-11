import initFootprint from './footprint';
import vanillaIntegration from './utils/vanilla-integration';

const getUrl = (env = 'production', branchName?: string) => {
  if (env === 'local') {
    return 'http://localhost:3000/';
  }
  if (env === 'development') {
    return 'https://id.preview.onefootprint.com';
  }
  if (env === 'preview' && branchName) {
    if (branchName === 'development') {
      return `https://id.preview.onefootprint.com`;
    }
    const slugBranch = branchName.toLowerCase().split('/').join('-');
    return `https://bifrost-git-${slugBranch}.preview.onefootprint.com`;
  }
  return 'https://id.onefootprint.com';
};

const url = getUrl(
  process.env.NEXT_PUBLIC_VERCEL_ENV,
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF,
);
const footprint = initFootprint(url);
vanillaIntegration(footprint)();
export default footprint;
