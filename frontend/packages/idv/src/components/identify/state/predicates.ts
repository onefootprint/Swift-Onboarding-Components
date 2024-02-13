import { ChallengeKind } from '@onefootprint/types';
import type { IdentifiedUser } from '@onefootprint/types/src/api/identify';

import { shouldChallengeEmail } from '../../../utils';
import type { EmailAndOrPhone } from '../types';
import {
  type IdentifiedEvent,
  type IdentifyMachineContext,
  IdentifyVariant,
} from './types';

export const hasBootstrapTruthyValue = (c: IdentifyMachineContext): boolean =>
  Object.values(c.bootstrapData).some(Boolean);

export const isNoPhoneFlow = (c: IdentifyMachineContext): boolean =>
  Boolean(c.config?.isNoPhoneFlow);

export const hasEmailAndPhoneNumber = (x: EmailAndOrPhone): boolean =>
  !!x.email && !!x.phoneNumber;

export const isUserFound = (user: IdentifiedUser | undefined): boolean =>
  !!user;

export const shouldShowChallengeSelector = (
  c: IdentifyMachineContext,
  user: IdentifiedUser | undefined,
) => {
  const hasMultipleChallenges =
    !!user && user?.availableChallengeKinds?.length > 1;
  const hasPasskeyChallenge =
    !!user && user?.availableChallengeKinds?.includes(ChallengeKind.biometric);
  const isUpdateLoginMethods = c.variant === IdentifyVariant.updateLoginMethods;
  return hasMultipleChallenges || hasPasskeyChallenge || isUpdateLoginMethods;
};

export const isUserFoundWithSingleChallenge = (
  user: IdentifiedUser | undefined,
  kind: ChallengeKind,
): boolean =>
  !!user &&
  user?.availableChallengeKinds?.length === 1 &&
  user?.availableChallengeKinds[0] === kind;

export const isEmailChallengePossible = (
  c: IdentifyMachineContext,
  e: IdentifiedEvent,
): boolean =>
  shouldChallengeEmail(
    isNoPhoneFlow(c),
    e.payload.user?.availableChallengeKinds,
  );
