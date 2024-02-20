import { ChallengeKind as Kind } from '@onefootprint/types';

import type {
  IdentifyMachineContext,
  IdentifyResult,
  NavigatedToPrevPage,
} from './types';
import { IdentifyVariant } from './types';

type User = IdentifyResult['user'];

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

export const isPrevSmsChallenge = (_: unknown, ev: NavigatedToPrevPage) =>
  ev.payload?.prev === 'smsChallenge';

export const isPrevEmailChallenge = (_: unknown, ev: NavigatedToPrevPage) =>
  ev.payload?.prev === 'emailChallenge';

export const hasEmailMethodUnVerified = (user: User): boolean =>
  !!user &&
  Array.isArray(user.authMethods) &&
  user.authMethods.some(x => x.kind === 'email' && !x.isVerified);
