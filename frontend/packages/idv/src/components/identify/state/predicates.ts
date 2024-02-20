import { ChallengeKind as Kind } from '@onefootprint/types';

import type { EmailAndOrPhone } from '../types';
import type {
  IdentifyMachineContext,
  IdentifyResult,
  NavigatedToPrevPage,
} from './types';
import { IdentifyVariant } from './types';

type User = IdentifyResult['user'];
type Obj = Record<string, unknown>;

const isObject = (x: unknown): x is Obj => typeof x === 'object' && !!x;

export const isEmail = (x: unknown): x is Kind.email => x === Kind.email;
export const isSms = (x: unknown): x is Kind.sms => x === Kind.sms;

export const isString = (x: unknown): x is string =>
  typeof x === 'string' && !!x;

export const isAuthVariant = (v: unknown): v is IdentifyVariant.auth =>
  v === IdentifyVariant.auth;

const isUpdateLoginMethodsVariant = (
  v: unknown,
): v is IdentifyVariant.updateLoginMethods =>
  v === IdentifyVariant.updateLoginMethods;

const hasMultipleChallenges = (user?: User): boolean =>
  !!user && user?.availableChallengeKinds?.length > 1;

const hasPasskeyChallenge = (user?: User): boolean =>
  !!user && user?.availableChallengeKinds?.includes(Kind.biometric);

export const hasBootstrapTruthyValue = (c: IdentifyMachineContext): boolean =>
  Object.values(c.bootstrapData).some(Boolean);

export const isNoPhoneFlow = (c: IdentifyMachineContext): boolean =>
  Boolean(c.config?.isNoPhoneFlow);

export const hasEmailAndPhoneNumber = (x: EmailAndOrPhone): boolean =>
  !!x.email && !!x.phoneNumber;

export const shouldShowChallengeSelector = (
  c: IdentifyMachineContext,
  user: User | undefined,
): boolean =>
  isUpdateLoginMethodsVariant(c.variant) ||
  hasMultipleChallenges(user) ||
  hasPasskeyChallenge(user);

export const isUserFoundWithSingleChallenge = (
  user: User,
  kind: Kind,
): boolean =>
  !!user &&
  user?.availableChallengeKinds?.length === 1 &&
  user?.availableChallengeKinds[0] === kind;

export const isEmailIdentifier = (o?: Obj): o is { email: string } =>
  isObject(o) && 'email' in o && isString(o.email);

export const isPhoneIdentifier = (o?: Obj): o is { phoneNumber: string } =>
  isObject(o) && 'phoneNumber' in o && isString(o.phoneNumber);

export const isPrevSmsChallenge = (_: unknown, ev: NavigatedToPrevPage) =>
  ev.payload?.prev === 'smsChallenge';

export const isPrevEmailChallenge = (_: unknown, ev: NavigatedToPrevPage) =>
  ev.payload?.prev === 'emailChallenge';

export const isEmailOrPhoneIdentifier = (
  o?: Obj,
): o is { email: string } | { phoneNumber: string } =>
  isEmailIdentifier(o) || isPhoneIdentifier(o);

export const hasEmailMethodUnVerified = (user: User): boolean =>
  !!user &&
  Array.isArray(user.authMethods) &&
  user.authMethods.some(x => x.kind === 'email' && !x.isVerified);
