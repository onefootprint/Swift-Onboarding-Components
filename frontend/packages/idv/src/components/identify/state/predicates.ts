import type { PublicOnboardingConfig } from '@onefootprint/types';
import { ChallengeKind as Kind } from '@onefootprint/types';
import { AuthMethodKind } from '@onefootprint/types/src/data';

import type { DeviceInfo } from '../../../hooks/ui/use-device-info/use-device-info';
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

const hasMultipleChallenges = (device: DeviceInfo, user?: User): boolean => {
  if (!user) return false;
  let { availableChallengeKinds } = user;
  // Check if device supports biometric challenge
  if (!device.hasSupportForWebauthn) {
    availableChallengeKinds = availableChallengeKinds.filter(
      kind => kind !== Kind.biometric,
    );
  }
  return availableChallengeKinds.length > 1;
};

export const hasBootstrapTruthyValue = (c: IdentifyMachineContext): boolean =>
  Object.values(c.bootstrapData).some(Boolean);

export const isNoPhoneFlow = (c: IdentifyMachineContext): boolean =>
  Boolean(c.config?.isNoPhoneFlow);

export const shouldShowChallengeSelector = (
  context: IdentifyMachineContext,
  user: User | undefined,
): boolean =>
  isUpdateLoginMethodsVariant(context.variant) ||
  hasMultipleChallenges(context.device, user);

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
