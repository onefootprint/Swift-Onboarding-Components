import type { NavigationHeaderLeftButtonProps } from '../../layout';
import type { IdentifyMachineHook } from '../state';
import { shouldShowChallengeSelector } from '../state/predicates';

const getLeftNavButton = (
  state: IdentifyMachineHook[0],
  send: IdentifyMachineHook[1],
): NavigationHeaderLeftButtonProps => {
  const { bootstrapData } = state.context;
  const onBack = () => send({ type: 'navigatedToPrevPage' });
  const CLOSE = { variant: 'close' } as const;
  const BACK = { variant: 'back', onBack } as const;

  // If true, we've been given information with which to identify the user, so we generally don't
  // want to allow going back to the email/phone input screens
  const identifyStartedWithBootstrapOrAuthToken =
    bootstrapData?.email ||
    bootstrapData?.phoneNumber ||
    state.context.initialAuthToken;

  // When true, there is a challenge selector screen before the SMS and email challenge screens
  const hasChallengeSelector = shouldShowChallengeSelector(
    state.context,
    state.context.identify.user,
  );

  if (state.matches('smsChallenge')) {
    if (hasChallengeSelector) {
      return BACK;
    }
    return identifyStartedWithBootstrapOrAuthToken ? CLOSE : BACK;
  }
  if (state.matches('emailChallenge')) {
    if (hasChallengeSelector) {
      return BACK;
    }
    return identifyStartedWithBootstrapOrAuthToken ? CLOSE : BACK;
  }
  if (state.matches('challengeSelectOrPasskey')) {
    return identifyStartedWithBootstrapOrAuthToken ? CLOSE : BACK;
  }
  if (state.matches('phoneIdentification')) {
    return identifyStartedWithBootstrapOrAuthToken ? CLOSE : BACK;
  }
  if (state.matches('emailIdentification')) {
    return CLOSE;
  }

  return BACK;
};

export default getLeftNavButton;
