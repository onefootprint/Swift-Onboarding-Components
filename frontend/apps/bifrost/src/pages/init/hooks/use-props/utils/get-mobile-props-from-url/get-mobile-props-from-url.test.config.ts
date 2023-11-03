const getUrl = ({
  userData,
  options,
  l10n,
}: {
  userData?: Record<string, string | string[]>;
  options?: Record<string, unknown>;
  l10n?: Record<string, unknown>;
}) => {
  let fragment = '';
  if (userData) {
    fragment += `${encodeURIComponent(JSON.stringify(userData))}`;
  }
  if (options) {
    if (fragment) {
      fragment += `__`;
    }
    fragment += `${encodeURIComponent(JSON.stringify(options))}`;
  }
  if (l10n) {
    if (fragment) {
      fragment += `__`;
    }
    fragment += `${encodeURIComponent(JSON.stringify(l10n))}`;
  }
  if (fragment) {
    fragment = `#${fragment}`;
  }
  return `/?public_key=123&redirect_url=redirectUrl${fragment}`;
};

export default getUrl;
