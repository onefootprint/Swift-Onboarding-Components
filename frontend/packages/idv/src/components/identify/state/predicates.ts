import type { PublicOnboardingConfig } from '@onefootprint/types';
import { ChallengeKind as Kind } from '@onefootprint/types';
import { AuthMethodKind } from '@onefootprint/types/src/data';

import type { DeviceInfo } from '../../../hooks/ui/use-device-info/use-device-info';
import type { IdentifyContext, IdentifyMachineContext, NavigatedToPrevPage } from './types';
import { IdentifyVariant } from './types';

type User = IdentifyContext['user'];

const isUpdateLoginMethodsVariant = (v: unknown): v is IdentifyVariant.updateLoginMethods =>
  v === IdentifyVariant.updateLoginMethods;

const availableChallengeKinds = (device: DeviceInfo, user: User) => {
  if (!user) return [];
  let { availableChallengeKinds: challengeKinds } = user;
  // Check if device supports biometric challenge
  if (!device.hasSupportForWebauthn) {
    challengeKinds = challengeKinds.filter(kind => kind !== Kind.biometric);
  }
  return challengeKinds;
};

const hasMultipleChallenges = (device: DeviceInfo, user?: User): boolean =>
  availableChallengeKinds(device, user).length > 1;

export const isUserFoundWithSingleChallenge = (device: DeviceInfo, user: User | undefined, kind: Kind): boolean => {
  const challengeKinds = availableChallengeKinds(device, user);
  return challengeKinds?.length === 1 && challengeKinds[0] === kind;
};

export const isNoPhoneFlow = (c: IdentifyMachineContext): boolean => Boolean(c.config?.isNoPhoneFlow);

export const shouldShowChallengeSelector = (context: IdentifyMachineContext, user: User | undefined): boolean =>
  isUpdateLoginMethodsVariant(context.variant) || hasMultipleChallenges(context.device, user);

export const isPrevSmsChallenge = (_: unknown, ev: NavigatedToPrevPage) => ev.payload?.prev === 'smsChallenge';

export const isPrevEmailChallenge = (_: unknown, ev: NavigatedToPrevPage) => ev.payload?.prev === 'emailChallenge';

export const requiresPhoneVerification = (
  config?: PublicOnboardingConfig,
  user?: User,
  completedAuthMethod?: AuthMethodKind,
): boolean => {
  const { phone } = AuthMethodKind;
  const playbookRequiresPhone = config?.requiredAuthMethods?.includes(phone);
  const userJustRegisteredPhone = completedAuthMethod === phone;
  const userHadPhone = user?.authMethods
    ?.filter(m => m.isVerified)
    .map(m => m.kind)
    .includes(phone);

  return !!playbookRequiresPhone && !userHadPhone && !userJustRegisteredPhone;
};
