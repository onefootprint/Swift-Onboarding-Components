import type {
  FootprintAppearance,
  FootprintOptions,
  FootprintUserData,
  OpenFootprint,
} from '../footprint.types';
import addFragmentAt from './add-fragment-at';
import encode from './encode';
import getAppearance from './get-appearance';

const getURL = (params: {
  appearance?: FootprintAppearance;
  publicKey?: string;
  userData?: FootprintUserData;
  options?: FootprintOptions;
  redirectUrl?: string;
  l10n?: OpenFootprint['l10n'];
}) => {
  const url = 'http://id.onefootprint.com';
  const { redirectUrl, publicKey } = params;
  const { fontSrc, rules, variables } = getAppearance(params.appearance);
  const userData = encode(params.userData);
  const options = encode(params.options);
  const l10n = encode(params.l10n);
  const searchParams = new URLSearchParams();
  if (publicKey) {
    searchParams.append('public_key', publicKey);
  }
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
  let urlFragment = '';
  if (userData) {
    urlFragment = `${userData}`;
  }
  if (options) {
    urlFragment = addFragmentAt(2, urlFragment, options);
  }
  if (l10n) {
    urlFragment = addFragmentAt(3, urlFragment, l10n);
  }

  if (urlFragment) {
    return `${url}?${searchParams.toString()}#${urlFragment}`;
  } else {
    return `${url}?${searchParams.toString()}`;
  }
};

export default getURL;
