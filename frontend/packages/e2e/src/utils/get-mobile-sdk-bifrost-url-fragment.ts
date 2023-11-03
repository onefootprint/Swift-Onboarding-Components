const getMobileSdkBifrostUrlFragment = ({
  userData,
  options,
  l10n,
}: {
  userData?: Record<string, string | string[]>;
  options?: Record<string, unknown>;
  l10n?: Record<string, unknown>;
}) => {
  const divider = '__';
  let fragment = '';
  if (userData) {
    fragment += `${encodeURIComponent(JSON.stringify(userData))}`;
  }
  if (options) {
    if (fragment) {
      fragment += divider;
    }
    fragment += `${encodeURIComponent(JSON.stringify(options))}`;
  }
  if (l10n) {
    if (fragment) {
      fragment += divider;
    }
    fragment += `${encodeURIComponent(JSON.stringify(l10n))}`;
  }
  if (fragment) {
    fragment = `#${fragment}`;
  }
  return fragment;
};

export default getMobileSdkBifrostUrlFragment;
