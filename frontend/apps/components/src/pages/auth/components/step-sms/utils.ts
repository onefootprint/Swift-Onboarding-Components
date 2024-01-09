import type { T } from '@onefootprint/hooks';
import { getScrubbedPhoneNumber } from '@onefootprint/idv';
import type {
  ChallengeData,
  Identifier as IdvIdentifier,
} from '@onefootprint/types';

import type { IdentifyResult } from '../../state';

export const getStepTitle = (t: T, identify: IdentifyResult): string => {
  const shouldShowWelcomeBack = identify.userFound && !identify.isUnverified;
  return shouldShowWelcomeBack
    ? t('sms-step.welcome-back-title')
    : t('sms-step.title');
};

export const getFormTitle = (
  t: T,
  challengeData: ChallengeData | undefined,
  identify: IdentifyResult,
): string => {
  const scrubbedPhoneNumber = getScrubbedPhoneNumber({
    challengeData,
    phoneNumber: identify.phoneNumber,
    successfulIdentifier: identify.successfulIdentifier as
      | IdvIdentifier
      | undefined,
  });

  return scrubbedPhoneNumber
    ? t('sms-step.prompt-with-phone', { scrubbedPhoneNumber })
    : t('sms-step.prompt-without-phone');
};
