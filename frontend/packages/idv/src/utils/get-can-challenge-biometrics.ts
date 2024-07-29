import { ChallengeKind } from '@onefootprint/types';

import type { DeviceInfo } from '../hooks';

const getCanChallengeBiometrics = (
  availableChallengeKinds?: ChallengeKind[],
  hasSyncablePassKey?: boolean,
  device?: DeviceInfo,
) => {
  if (!device) {
    return false;
  }
  const hasAvailableBiometricChallenge = availableChallengeKinds?.includes(ChallengeKind.biometric);
  if (!hasAvailableBiometricChallenge) {
    return false;
  }
  if (device.type === 'mobile') {
    return device.hasSupportForWebauthn;
  }

  return device.hasSupportForWebauthn && hasSyncablePassKey;
};

export default getCanChallengeBiometrics;
