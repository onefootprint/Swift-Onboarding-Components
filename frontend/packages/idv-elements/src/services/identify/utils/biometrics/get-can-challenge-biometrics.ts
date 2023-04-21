import { DeviceInfo } from '@onefootprint/hooks';
import { ChallengeKind } from '@onefootprint/types';

import { MachineChallengeContext } from '../state-machine';

const getCanChallengeBiometrics = (
  device: DeviceInfo,
  challengeContext: MachineChallengeContext,
) => {
  const hasAvailableBiometricChallenge =
    challengeContext.availableChallengeKinds?.includes(ChallengeKind.biometric);
  if (!hasAvailableBiometricChallenge) {
    return false;
  }
  if (device.type === 'mobile') {
    return device.hasSupportForWebauthn;
  }

  return device.hasSupportForWebauthn && challengeContext.hasSyncablePassKey;
};

export default getCanChallengeBiometrics;
