import type { NavigationHeaderLeftButtonProps } from '../../../../layout';
import type { IdentifyMachineHook } from '../state';
import { shouldShowChallengeSelector } from '../state/utils';

const getLeftNavButton = (
  state: IdentifyMachineHook[0],
  send: IdentifyMachineHook[1],
  onBackFromLogin?: () => void,
): NavigationHeaderLeftButtonProps => {
  const { context, history, matches } = state;
  const { bootstrapData } = context;
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

  // If true, we've been given information with which to identify the user, so we generally don't
  // want to allow going back to the email/phone input screens
  const identifyStartedWithBootstrapOrAuthToken =
    bootstrapData?.email || bootstrapData?.phoneNumber || context.initialAuthToken;

  // When true, there is a challenge selector screen before the SMS and email challenge screens
  const hasChallengeSelector = shouldShowChallengeSelector(context, context.identify.user);

  if (matches('smsChallenge')) {
    if (hasChallengeSelector) {
      return BACK;
    }
    return identifyStartedWithBootstrapOrAuthToken ? (BACK_FROM_LOGIN ?? CLOSE) : BACK;
  }
  if (matches('emailChallenge')) {
    if (hasChallengeSelector) {
      return BACK;
    }
    return identifyStartedWithBootstrapOrAuthToken ? (BACK_FROM_LOGIN ?? CLOSE) : BACK;
  }
  if (matches('challengeSelectOrPasskey')) {
    return identifyStartedWithBootstrapOrAuthToken ? (BACK_FROM_LOGIN ?? CLOSE) : BACK;
  }
  if (matches('phoneIdentification')) {
    return BACK;
  }
  if (matches('emailIdentification')) {
    return CLOSE;
  }
  if (matches('addPhone')) {
    return CLOSE;
  }

  return BACK;
};

export default getLeftNavButton;
