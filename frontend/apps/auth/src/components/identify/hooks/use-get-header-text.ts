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

  if (state.matches('smsChallenge')) {
    // We always show the "welcome back" message on challenge selector, so don't need it on sms screen
    return hasChallengeSelector
      ? t('sms-step.verify-title')
      : t('sms-step.welcome-back-title');
  }
  if (state.matches('emailChallenge')) {
    // We always show the "welcome back" message on challenge selector, so don't need it on email screen
    return hasChallengeSelector
      ? t('email-challenge.verify-title')
      : t('email-challenge.welcome-back-title');
  }
  if (state.matches('challengeSelectOrPasskey')) {
    return t('challenge-select-or-biometric.welcome-back-title');
  }

  // We won't use this on any other page, but in case we do
  return t(`${state.value}.title` as ParseKeys<'identify'>);
};

export default useGetHeaderText;
