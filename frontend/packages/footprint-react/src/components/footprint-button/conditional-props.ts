import type {
  FootprintAuthProps,
  FootprintUpdateLoginMethodsProps,
  FootprintVerifyProps,
} from '@onefootprint/footprint-js';

import type { AuthAuthTokenOnly, AuthPublicKeyOnly, AuthTokenOnly, PublicKeyOnly } from './types';

export const getConditionalVerifyProps = (p: FootprintVerifyProps): TypeError | AuthTokenOnly | PublicKeyOnly => {
  const { authToken, publicKey } = p;
  if (authToken) return { authToken } as AuthTokenOnly;
  if (publicKey) return { publicKey } as PublicKeyOnly;
  return new TypeError('Missing parameter. Please add "authToken" or "publicKey"');
};

export const getConditionalUpdateLoginMethodsProps = (
  p: FootprintUpdateLoginMethodsProps,
): TypeError | AuthTokenOnly =>
  p.authToken
    ? ({ authToken: p.authToken } as AuthTokenOnly)
    : new TypeError('Missing parameter. Please add "authToken"');

export const getConditionalAuthProps = (p: FootprintAuthProps): TypeError | AuthAuthTokenOnly | AuthPublicKeyOnly => {
  const { authToken, publicKey, updateLoginMethods } = p;

  if (publicKey) {
    return { publicKey } as AuthPublicKeyOnly;
  }

  if (authToken && updateLoginMethods) {
    return { authToken, updateLoginMethods } as AuthAuthTokenOnly;
  }

  return new TypeError('Missing parameter. Please add "authToken" with "updateLoginMethods" or "publicKey"');
};
