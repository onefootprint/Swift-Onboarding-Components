import type { NavigationHeaderLeftButtonProps } from '@onefootprint/idv';

import type { AuthMachineHook } from '@/src/state';

const getAuthLeftNavButton = (
  state: AuthMachineHook[0],
  send: AuthMachineHook[1],
): NavigationHeaderLeftButtonProps => {
  const { bootstrapData } = state.context;
  const onBack = () => send({ type: 'navigatedToPrevPage' });
  const CLOSE = { variant: 'close' } as const;
  const BACK = { variant: 'back', onBack } as const;

  if (state.matches('smsChallenge')) {
    return bootstrapData?.email || bootstrapData?.phoneNumber ? CLOSE : BACK;
  }
  if (state.matches('emailChallenge')) {
    return bootstrapData?.email ? CLOSE : BACK;
  }
  if (state.matches('challengeSelectOrPasskey')) {
    return bootstrapData?.email || bootstrapData?.phoneNumber ? CLOSE : BACK;
  }
  if (state.matches('phoneIdentification')) {
    return bootstrapData?.email || bootstrapData?.phoneNumber ? BACK : CLOSE;
  }
  if (state.matches('emailIdentification')) {
    return CLOSE;
  }

  return BACK;
};

export default getAuthLeftNavButton;
