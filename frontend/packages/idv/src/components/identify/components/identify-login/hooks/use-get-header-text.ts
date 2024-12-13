import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

import { useIdentifyMachine } from '../state';
import { shouldShowChallengeSelector } from '../state/utils';

const useGetHeaderText = (): string => {
  const [state] = useIdentifyMachine();
  const { t } = useTranslation('identify');

  const hasChallengeSelector = shouldShowChallengeSelector(state.context, state.context.identify.user);
  // Show welcome back if we're doing a login challenge and the user is _not_ unverified
  const shouldShowWelcomeBack = !!state.context.identify.user && !state.context.identify.user.isUnverified;

  if (state.matches('smsChallenge')) {
    // If we showed the challenge selector screen, we already displayed "Welcome back" text
    return shouldShowWelcomeBack && !hasChallengeSelector
      ? t('sms-challenge.welcome-back-title')
      : t('sms-challenge.verify-title');
  }
  if (state.matches('emailChallenge')) {
    // If we showed the challenge selector screen, we already displayed "Welcome back" text
    return shouldShowWelcomeBack && !hasChallengeSelector
      ? t('email-challenge.welcome-back-title')
      : t('email-challenge.verify-title');
  }
  if (state.matches('challengeSelectOrPasskey')) {
    return shouldShowWelcomeBack
      ? t('challenge-select-or-biometric.welcome-back-title')
      : t('challenge-select-or-biometric.verify-title');
  }

  // We won't use this on any other page, but in case we do
  return t(`${state.value}.title` as ParseKeys<'identify'>);
};

export default useGetHeaderText;
