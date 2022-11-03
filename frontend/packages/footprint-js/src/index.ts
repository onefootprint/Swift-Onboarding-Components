import initFootprint from './footprint';
import vanillaIntegration from './utils/vanilla-integration';

const getUrl = () => {
  if (process.env.IS_LOCAL) {
    return 'url:local';
  }
  if (process.env.IS_VERCEL_ENV_DEV) {
    return 'url:dev';
  }
  if (process.env.IS_VERCEL_ENV_PREV) {
    return 'url:preview';
  }
  return 'url:prod';
};

const url = getUrl();
const footprint = initFootprint(url);
vanillaIntegration(footprint);

export * from './types/footprint.types';
export default footprint;
