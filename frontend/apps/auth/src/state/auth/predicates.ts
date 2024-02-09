import { shouldChallengeEmail } from '@onefootprint/idv';
import type { ChallengeKind } from '@onefootprint/types';
import type { IdentifiedUser } from '@onefootprint/types/src/api/identify';

import type { EmailAndOrPhone } from '@/src/types';

import type { AuthMachineContext, IdentifiedEvent } from './types';

export const hasBootstrapTruthyValue = (c: AuthMachineContext): boolean =>
  Object.values(c.bootstrapData).some(Boolean);

export const isNoPhoneFlow = (c: AuthMachineContext): boolean =>
  Boolean(c.config.isNoPhoneFlow);

export const hasEmailAndPhoneNumber = (x: EmailAndOrPhone): boolean =>
  !!x.email && !!x.phoneNumber;

export const isUserFound = (user: IdentifiedUser | undefined): boolean =>
  !!user;

export const isUserFoundWithMultipleChallenges = (
  user: IdentifiedUser | undefined,
): boolean => !!user && user?.availableChallengeKinds?.length > 1;

export const isUserFoundWithSingleChallenge = (
  user: IdentifiedUser | undefined,
  kind: ChallengeKind,
): boolean =>
  !!user &&
  user?.availableChallengeKinds?.length === 1 &&
  user?.availableChallengeKinds[0] === kind;

export const isEmailChallengePossible = (
  c: AuthMachineContext,
  e: IdentifiedEvent,
): boolean =>
  shouldChallengeEmail(
    isNoPhoneFlow(c),
    e.payload.user?.availableChallengeKinds,
  );
