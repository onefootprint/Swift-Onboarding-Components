import type { OpenFootprint } from '../footprint.types';
import getAppearance from './get-appearance';

const getURL = (params: {
  appearance?: OpenFootprint['appearance'];
  redirectUrl?: string;
}) => {
  const url = 'http://id.onefootprint.com';
  const { redirectUrl } = params;
  const { fontSrc, rules, variables } = getAppearance(params.appearance);
  const searchParams = new URLSearchParams();
  if (variables) {
    searchParams.append('variables', variables);
  }
  if (rules) {
    searchParams.append('rules', rules);
  }
  if (fontSrc) {
    searchParams.append('font_src', fontSrc);
  }
  if (redirectUrl) {
    searchParams.append('redirect_url', redirectUrl);
  }

  return `${url}?${searchParams.toString()}`;
};

export default getURL;
