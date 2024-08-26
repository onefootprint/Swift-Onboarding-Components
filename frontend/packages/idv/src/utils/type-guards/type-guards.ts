import { FootprintComponentKind as SdkKind } from '@onefootprint/footprint-js';
import { AuthMethodKind, ChallengeKind as Kind } from '@onefootprint/types';
import type { IdentifiedUser } from '@onefootprint/types/src/api/identify';
import curry from 'lodash/fp/curry';

type Obj = Record<string, unknown>;
type Maybe<T> = T | null | undefined;
type HasAuthMethods = Pick<IdentifiedUser, 'authMethods'>;

export const isAuth = (x: unknown): x is SdkKind.Auth => x === SdkKind.Auth;

export const isPhone = (x: unknown): x is AuthMethodKind.phone => x === AuthMethodKind.phone;

export const isSms = (x: unknown): x is Kind.sms => x === Kind.sms;
export const isEmail = (x: unknown): x is Kind.email => x === Kind.email;
export const isBiometric = (x: unknown): x is Kind.biometric => x === Kind.biometric;

export const isFunction = (x: unknown): x is Function => typeof x === 'function';

export const isUndefined = (x: unknown): x is undefined => typeof x === 'undefined';

export const isObject = (x: unknown): x is Obj => !!x && typeof x === 'object' && !Array.isArray(x);
export const isString = (x: unknown): x is string => typeof x === 'string';
export const isNumber = (x: unknown): x is number => typeof x === 'number';
export const isStringValid = (x: unknown): x is string => isString(x) && !!x;

export const isError = (x: unknown): x is Error => x instanceof Error;

const hasAuthMethod = curry(
  (flag: boolean, kind: `${AuthMethodKind}`, obj: Maybe<HasAuthMethods>): boolean =>
    !!obj?.authMethods?.some(m => m.kind === kind && m.isVerified === flag),
);

const hasAuthMethodUnverified = hasAuthMethod(false);
export const hasAuthMethodUnverifiedEmail = hasAuthMethodUnverified('email');
