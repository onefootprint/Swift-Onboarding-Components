import type { Props } from '../../types/components';
import { ComponentKind, ComponentsSdkProps } from '../../types/components';

const isAuth = (x: unknown): x is ComponentKind.Auth => x === ComponentKind.Auth;

const isVerify = (x: unknown): x is ComponentKind.Verify => x === ComponentKind.Verify;

const isUpdateLogin = (x: unknown): x is ComponentKind.UpdateLoginMethods => x === ComponentKind.UpdateLoginMethods;

const isComponentsSdk = (x: unknown): x is ComponentKind.Components => x === ComponentKind.Components;

export const isComponentsSdkProps = (p: Props): p is ComponentsSdkProps => p.kind === ComponentKind.Components;

export const isAuthOrVerifyOrUpdateLogin = (x: unknown) =>
  [isAuth, isVerify, isComponentsSdk, isUpdateLogin].some(fn => fn(x));

export const isValidString = (x: unknown) => typeof x === 'string' && x.length > 0;

/**
 * @deprecated after version 3.9.0
 */
export const isAuthUpdateLoginMethods = (obj: Props): boolean =>
  isAuth(obj.kind) &&
  Boolean('updateLoginMethods' in obj && obj.updateLoginMethods) &&
  !!obj.authToken &&
  /tok_/.test(obj.authToken);

const isUpdateLoginMethodsKind = (obj: Props): boolean =>
  isUpdateLogin(obj.kind) && !!obj.authToken && /tok_/.test(obj.authToken);

export const isUpdateLoginMethods = (obj: Props) =>
  [isAuthUpdateLoginMethods, isUpdateLoginMethodsKind].some(fn => fn(obj));
