import type { NavigationHeaderLeftButtonProps } from '@onefootprint/idv';
import { getCanChallengeBiometrics } from '@onefootprint/idv';

import type { AuthMachineHook } from '../../state';

const getHeaderLeftButton = (
  state: AuthMachineHook[0],
  send: AuthMachineHook[1],
): NavigationHeaderLeftButtonProps => {
  const { bootstrapData, device, challenge } = state.context;
  const onBack = () => send({ type: 'navigatedToPrevPage' });
  const CLOSE = { variant: 'close' } as const;
  const BACK = { variant: 'back', onBack } as const;

  if (state.matches('smsChallenge')) {
    const shouldShowBack =
      !!(bootstrapData?.email || bootstrapData?.phoneNumber) ||
      getCanChallengeBiometrics(
        challenge.availableChallengeKinds,
        challenge.hasSyncablePassKey,
        device,
      );
    return shouldShowBack ? BACK : CLOSE;
  }
  if (state.matches('emailChallenge')) {
    return bootstrapData?.email ? CLOSE : BACK;
  }
  if (state.matches('biometricChallenge')) {
    return bootstrapData?.email || bootstrapData?.phoneNumber ? CLOSE : BACK;
  }

  return BACK;
};

export default getHeaderLeftButton;
