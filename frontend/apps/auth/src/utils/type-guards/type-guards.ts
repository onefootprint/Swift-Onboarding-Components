import { FootprintComponentKind } from '@onefootprint/footprint-js';
import { ChallengeKind } from '@onefootprint/types';
import anyPass from 'lodash/fp/anyPass';

type Obj = Record<string, unknown>;

const { sms, email, biometric } = ChallengeKind;
const isBiometric = (x: unknown): x is typeof biometric => x === biometric;
const isEmail = (x: unknown): x is typeof email => x === email;
const isPasskey = (x: unknown): x is 'passkey' => x === 'passkey';
const isPhone = (x: unknown): x is 'phone' => x === 'phone';
const isSms = (x: unknown): x is typeof sms => x === sms;

const isBiometricOrPasskey = anyPass([isBiometric, isPasskey]);
const isSmsOrPhone = anyPass([isSms, isPhone]);

const isAuth = (x: unknown) => x === FootprintComponentKind.Auth;

const isString = (x: unknown): x is string => typeof x === 'string';

const isObject = (x: unknown): x is Obj => typeof x === 'object' && !!x;

const isNotEmptyArray = (x: unknown): boolean =>
  Array.isArray(x) && x.length > 0;

export {
  isAuth,
  isBiometric,
  isBiometricOrPasskey,
  isEmail,
  isNotEmptyArray,
  isObject,
  isPasskey,
  isPhone,
  isSms,
  isSmsOrPhone,
  isString,
};
