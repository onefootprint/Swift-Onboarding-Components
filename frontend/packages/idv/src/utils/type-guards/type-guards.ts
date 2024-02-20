import { FootprintComponentKind as SdkKind } from '@onefootprint/footprint-js';
import { ChallengeKind as Kind } from '@onefootprint/types';

type Obj = Record<string, unknown>;

export const isAuth = (x: unknown) => x === SdkKind.Auth;

export const isSms = (x: unknown): x is Kind.sms => x === Kind.sms;
export const isEmail = (x: unknown): x is Kind.email => x === Kind.email;
export const isBiometric = (x: unknown): x is Kind.biometric =>
  x === Kind.biometric;

export const isFunction = (x: unknown): x is Function =>
  typeof x === 'function';

export const isUndefined = (x: unknown): x is undefined =>
  typeof x === 'undefined';

export const isObject = (x: unknown): x is Obj => typeof x === 'object' && !!x;
export const isString = (x: unknown): x is string => typeof x === 'string';
export const isStringValid = (x: unknown): x is string => isString(x) && !!x;

export const isError = (x: unknown): x is Error => x instanceof Error;

export const isEmailIdentifier = (o?: Obj): o is { email: string } =>
  isObject(o) && 'email' in o && isStringValid(o.email);

export const isPhoneIdentifier = (o?: Obj): o is { phoneNumber: string } =>
  isObject(o) && 'phoneNumber' in o && isStringValid(o.phoneNumber);

export const isEmailOrPhoneIdentifier = (
  o?: Obj,
): o is { email: string } | { phoneNumber: string } =>
  isEmailIdentifier(o) || isPhoneIdentifier(o);

export const hasEmailAndPhoneNumber = (
  o: Obj,
): o is { email: string; phoneNumber: string } =>
  isEmailIdentifier(o) && isPhoneIdentifier(o);
