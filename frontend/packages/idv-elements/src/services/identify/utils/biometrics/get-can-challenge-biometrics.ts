import { DeviceInfo } from '@onefootprint/hooks';
import { ChallengeKind } from '@onefootprint/types';

import { MachineChallengeContext } from '../state-machine';

const getCanChallengeBiometrics = (
  challengeContext: MachineChallengeContext,
  device?: DeviceInfo,
) => {
  if (!device) {
    return false;
  }
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
