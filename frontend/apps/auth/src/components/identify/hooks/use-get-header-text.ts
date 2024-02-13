import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

import { useIdentifyMachine } from '../state';
import { shouldShowChallengeSelector } from '../state/predicates';

const useGetHeaderText = (): string => {
  const [state] = useIdentifyMachine();
  const { t } = useTranslation('identify');

  const hasChallengeSelector = shouldShowChallengeSelector(
    state.context,
    state.context.identify.user,
  );
  const isLoginChallenge = !!state.context.identify.user;

  if (state.matches('smsChallenge')) {
    // If we showed the challenge selector screen, we already displayed "Welcome back" text
    return isLoginChallenge && !hasChallengeSelector
      ? t('sms-step.welcome-back-title')
      : t('sms-step.verify-title');
  }
  if (state.matches('emailChallenge')) {
    // If we showed the challenge selector screen, we already displayed "Welcome back" text
    return isLoginChallenge && !hasChallengeSelector
      ? t('email-challenge.welcome-back-title')
      : t('email-challenge.verify-title');
  }
  if (state.matches('challengeSelectOrPasskey')) {
    return t('challenge-select-or-biometric.welcome-back-title');
  }

  // We won't use this on any other page, but in case we do
  return t(`${state.value}.title` as ParseKeys<'identify'>);
};

export default useGetHeaderText;
