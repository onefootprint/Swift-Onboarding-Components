import type { Props } from '../../types/components';
import { ComponentKind } from '../../types/components';

const isAuth = (x: unknown): x is ComponentKind.Auth =>
  x === ComponentKind.Auth;

const isVerify = (x: unknown): x is ComponentKind.Verify =>
  x === ComponentKind.Verify;

export const isAuthOrVerify = (x: unknown) =>
  [isAuth, isVerify].some(fn => fn(x));

export const isValidString = (x: unknown) =>
  typeof x === 'string' && x.length > 0;

export const isAuthUpdateLoginMethods = (obj: Props): boolean =>
  isAuth(obj.kind) &&
  Boolean('updateLoginMethods' in obj && obj.updateLoginMethods) &&
  !!obj.authToken &&
  /^tok_/.test(obj.authToken);
