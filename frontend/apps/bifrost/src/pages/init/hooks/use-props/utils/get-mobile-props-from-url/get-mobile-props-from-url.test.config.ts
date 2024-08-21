type GetUrlArg = {
  bootstrapData?: Record<string, string | string[]>;
  options?: Record<string, unknown>;
  l10n?: Record<string, unknown>;
};

const getUrl = ({ bootstrapData, options, l10n }: GetUrlArg) => {
  let fragment = '';
  if (bootstrapData) {
    fragment += `${encodeURIComponent(JSON.stringify(bootstrapData))}`;
  }
  if (options) {
    if (fragment) {
      fragment += '__';
    }
    fragment += `${encodeURIComponent(JSON.stringify(options))}`;
  }
  if (l10n) {
    if (fragment) {
      fragment += '__';
    }
    fragment += `${encodeURIComponent(JSON.stringify(l10n))}`;
  }
  if (fragment) {
    fragment = `#${fragment}`;
  }
  return `/?public_key=123&redirect_url=redirectUrl${fragment}`;
};

export default getUrl;
