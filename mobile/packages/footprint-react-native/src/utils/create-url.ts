import type { Appearance, L10n } from '../types';

const createUrl = ({
  appearance,
  l10n,
  redirectUrl,
  token,
}: {
  appearance?: Appearance;
  l10n?: L10n;
  redirectUrl?: string;
  token: string;
}) => {
  const baseUrl = createComponentUrl();
  const searchParams = createSearchParams({ appearance, l10n, redirectUrl });
  return `${baseUrl}?${searchParams}#${token}`;
};

const encode = (obj?: Record<string, unknown>): string => {
  return obj && Object.keys(obj).length
    ? encodeURIComponent(JSON.stringify(obj))
    : '';
};

const createComponentUrl = () => {
  return 'https://id.onefootprint.com';
};

const createSearchParams = ({
  appearance,
  l10n,
  redirectUrl,
}: {
  appearance?: Appearance;
  l10n?: L10n;
  redirectUrl?: string;
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
  return searchParams.toString();
};

export default createUrl;
