import vanillaIntegration from './adapters/vanilla';
import Footprint from './footprint';
import UiManager from './footprint/ui-manager';

const getUrl = (env = 'local', branchName?: string) => {
  if (env === 'local') {
    return 'http://localhost:3000/';
  }
  if (env === 'development') {
    return 'https://id.preview.onefootprint.com';
  }
  if (env === 'preview' && branchName) {
    const slugBranch = branchName.toLowerCase().split('/').join('-');
    return `https://bifrost-git-${slugBranch}.preview.onefootprint.com`;
  }
  return 'https://id.onefootprint.com';
};

const url = getUrl(
  process.env.NEXT_PUBLIC_VERCEL_ENV,
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF,
);

const uiManager = new UiManager();
const footprint = new Footprint(url, uiManager);
vanillaIntegration(footprint)();

export default footprint;
