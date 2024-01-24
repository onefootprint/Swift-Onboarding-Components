import type { NavigationHeaderLeftButtonProps } from '@onefootprint/idv';

import type { UserMachineHook } from '@/src/state';

const getUserLeftNavButton = (
  state: UserMachineHook[0],
  send: UserMachineHook[1],
): NavigationHeaderLeftButtonProps => {
  const onBack = () => send({ type: 'goToBack' });
  const CLOSE: NavigationHeaderLeftButtonProps = { variant: 'close' };
  const BACK: NavigationHeaderLeftButtonProps = { variant: 'back', onBack };

  return [
    'emailChallenge',
    'passkeyChallenge',
    'phoneChallenge',
    'updateEmail',
    'updatePasskey',
    'updatePhone',
    'updatePhoneVerify',
  ].some(state.matches)
    ? BACK
    : CLOSE;
};

export default getUserLeftNavButton;
