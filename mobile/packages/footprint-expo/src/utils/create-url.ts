import type { OpenFootprint } from '../footprint.types';
import getAppearance from './get-appearance';

const createUrl = ({
  appearance,
  redirectUrl,
  token,
}: {
  appearance?: OpenFootprint['appearance'];
  redirectUrl?: string;
  token: string;
}) => {
  const url = 'http://id.onefootprint.com';
  const { fontSrc, rules, variables } = getAppearance(appearance);
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

  return `${url}?${searchParams.toString()}#${token}`;
};

export default createUrl;
