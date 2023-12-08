import type { OpenFootprint } from '../footprint.types';

const encode = (obj?: Record<string, unknown>): string => {
  return obj && Object.keys(obj).length
    ? encodeURIComponent(JSON.stringify(obj))
    : '';
};

const createUrl = ({
  appearance,
  redirectUrl,
  token,
}: {
  appearance?: OpenFootprint['appearance'];
  redirectUrl: string;
  token: string;
}) => {
  const searchParams = new URLSearchParams();
  searchParams.append('redirect_url', redirectUrl);

  if (appearance) {
    const variables = encode(appearance.variables);
    const rules = encode(appearance.rules);

    if (variables) {
      searchParams.append('variables', variables);
    }
    if (rules) {
      searchParams.append('rules', rules);
    }
    if (appearance.fontSrc) {
      searchParams.append('font_src', appearance.fontSrc);
    }
  }

  return `https://id.onefootprint.com?${searchParams.toString()}#${token}`;
};

export default createUrl;
