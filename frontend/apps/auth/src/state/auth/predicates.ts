import {
  getCanChallengeBiometrics,
  shouldChallengeEmail,
} from '@onefootprint/idv';

import type { EmailAndOrPhone } from '@/src/types';

import type { AuthMachineContext, IdentifiedEvent } from './types';

type IdentifiedPayload = IdentifiedEvent['payload'];

export const hasBootstrapTruthyValue = (c: AuthMachineContext): boolean =>
  Object.values(c.bootstrapData).some(Boolean);

export const isNoPhoneFlow = (c: AuthMachineContext): boolean =>
  Boolean(c.config.isNoPhoneFlow);

export const hasEmailAndPhoneNumber = (x: EmailAndOrPhone): boolean =>
  !!x.email && !!x.phoneNumber;

export const isUserNotFoundOrNoChallengesAvailable = (
  x: IdentifiedPayload,
): boolean =>
  !x.userFound ||
  !x.availableChallengeKinds ||
  x.availableChallengeKinds.length === 0;

export const isUserNotFoundOrHasPhoneNumber = (
  c: AuthMachineContext,
): boolean => !c.identify.userFound || !!c.identify.phoneNumber;

export const isEmailChallengePossible = (
  c: AuthMachineContext,
  e: IdentifiedEvent,
): boolean =>
  shouldChallengeEmail(isNoPhoneFlow(c), e.payload.availableChallengeKinds);

export const isBiometricChallengeAllowed = (
  c: AuthMachineContext,
  e: IdentifiedEvent,
): boolean => {
  const { device } = c;
  const { availableChallengeKinds, hasSyncablePassKey } = e.payload;
  return !!getCanChallengeBiometrics(
    availableChallengeKinds,
    hasSyncablePassKey,
    device,
  );
};
