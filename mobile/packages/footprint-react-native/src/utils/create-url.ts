import type {
  FootprintAppearance,
  FootprintUserData,
} from '../footprint.types';
import getAppearance from './get-appearance';
import getUserData from './get-user-data';

const getURL = (params: {
  appearance?: FootprintAppearance;
  publicKey?: string;
  userData?: FootprintUserData;
  redirectUrl?: string;
}) => {
  const url = 'http://id.onefootprint.com';
  const { redirectUrl, publicKey } = params;
  const { fontSrc, rules, variables } = getAppearance(params.appearance);
  const userData = getUserData(params.userData);
  const searchParams = new URLSearchParams();
  if (publicKey) {
    searchParams.append('public_key', publicKey);
  }
  if (variables) {
    searchParams.append('tokens', variables);
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
  if (userData) {
    return `${url}?${searchParams.toString()}#${userData}`;
  } else {
    return `${url}?${searchParams.toString()}`;
  }
};

export default getURL;
