import { FootprintComponentKind } from '@onefootprint/footprint-js';
import { ChallengeKind } from '@onefootprint/types';

type Obj = Record<string, unknown>;

const { sms, email, biometric } = ChallengeKind;
const isSms = (x: unknown): x is ChallengeKind.sms => x === sms;
const isEmail = (x: unknown): x is ChallengeKind.email => x === email;
const isPasskey = (x: unknown): x is ChallengeKind.biometric => x === biometric;

const isAuth = (x: unknown) => x === FootprintComponentKind.Auth;

const isString = (x: unknown): x is string => typeof x === 'string';

const isObject = (x: unknown): x is Obj => typeof x === 'object' && !!x;

const isNotEmptyArray = (x: unknown): boolean =>
  Array.isArray(x) && x.length > 0;

export {
  isAuth,
  isEmail,
  isNotEmptyArray,
  isObject,
  isPasskey,
  isSms,
  isString,
};
