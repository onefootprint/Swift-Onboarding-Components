import type { FootprintVerifyProps } from '../footprint.types';

const encode = (obj?: Record<string, unknown>): string => {
  return obj && Object.keys(obj).length
    ? encodeURIComponent(JSON.stringify(obj))
    : '';
};

const createUrl = ({
  appearance,
  l10n,
  redirectUrl,
  token,
}: {
  appearance?: FootprintVerifyProps['appearance'];
  l10n?: FootprintVerifyProps['l10n'];
  redirectUrl?: string;
  token: string;
}) => {
  const searchParams = new URLSearchParams();

  if (redirectUrl) {
    searchParams.append('redirect_url', redirectUrl);
  }

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
    if (l10n?.language) {
      searchParams.append('lng', l10n.language);
    }
  }

  return `https://id.onefootprint.com?${searchParams.toString()}#${token}`;
};

export default createUrl;
