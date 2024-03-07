import type { NavigationHeaderLeftButtonProps } from '../../../../../layout';
import type { AuthMethodsMachineHook } from '../../state';

const getHeaderLeftNavButton = (
  state: AuthMethodsMachineHook[0],
  send: AuthMethodsMachineHook[1],
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

export default getHeaderLeftNavButton;
