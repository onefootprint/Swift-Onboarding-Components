import type {
  FootprintAppearance,
  FootprintOptions,
  FootprintUserData,
} from '../footprint.types';
import getAppearance from './get-appearance';
import getOptions from './get-options';
import getUserData from './get-user-data';

const getURL = (params: {
  appearance?: FootprintAppearance;
  publicKey?: string;
  userData?: FootprintUserData;
  options?: FootprintOptions;
  redirectUrl?: string;
}) => {
  const url = 'http://id.onefootprint.com';
  const { redirectUrl, publicKey } = params;
  const { fontSrc, rules, variables } = getAppearance(params.appearance);
  const userData = getUserData(params.userData);
  const options = getOptions(params.options);
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
    urlFragment = `${urlFragment}__${options}`;
  }

  if (urlFragment) {
    return `${url}?${searchParams.toString()}#${urlFragment}`;
  } else {
    return `${url}?${searchParams.toString()}`;
  }
};

export default getURL;
