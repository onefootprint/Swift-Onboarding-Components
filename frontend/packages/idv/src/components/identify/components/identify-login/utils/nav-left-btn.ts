import type { NavigationHeaderLeftButtonProps } from '../../../../layout';
import type { IdentifyMachineHook } from '../state';
import { shouldShowChallengeSelector } from '../state/utils';

const getLeftNavButton = (
  state: IdentifyMachineHook[0],
  send: IdentifyMachineHook[1],
  onBackFromLogin?: () => void,
): NavigationHeaderLeftButtonProps => {
  const { context, history, matches } = state;
  const onBack = () =>
    send({
      type: 'navigatedToPrevPage',
      payload: {
        prev: history?.value,
        curr: state.value,
      },
    });
  const CLOSE = { variant: 'close' } as const;
  const BACK = { variant: 'back', onBack } as const;
  // Special case to handle the back button to return from IdentifyLogin to the IdentifySignup flow
  const BACK_FROM_LOGIN = onBackFromLogin ? ({ variant: 'back', onBack: onBackFromLogin } as const) : undefined;

  // When true, there is a challenge selector screen before the SMS and email challenge screens
  const hasChallengeSelector = shouldShowChallengeSelector(context);

  if (matches('smsChallenge')) {
    if (hasChallengeSelector) {
      return BACK;
    }
    return BACK_FROM_LOGIN ?? CLOSE;
  }
  if (matches('emailChallenge')) {
    if (hasChallengeSelector) {
      return BACK;
    }
    return BACK_FROM_LOGIN ?? CLOSE;
  }
  if (matches('challengeSelectOrPasskey')) {
    return BACK_FROM_LOGIN ?? CLOSE;
  }
  if (matches('addPhone') || matches('addEmail')) {
    return CLOSE;
  }

  return BACK;
};

export default getLeftNavButton;
