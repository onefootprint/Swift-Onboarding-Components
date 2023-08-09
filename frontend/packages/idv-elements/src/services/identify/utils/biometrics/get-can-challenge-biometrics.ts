import { ChallengeKind } from '@onefootprint/types';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';
import { MachineChallengeContext } from '../state-machine/types';

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
