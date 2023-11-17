import { Container, PinInput } from '@onefootprint/ui';
import React from 'react';

import Header from '@/components/header';
import useTranslation from '@/hooks/use-translation';

import getScrubbedPhoneNumber from './utils/get-scrubbed-phone-number';

export type SmsChallengeProps = {
  onDone: () => void;
};

const SmsChallenge = ({ onDone }: SmsChallengeProps) => {
  const { t } = useTranslation('pages.sms-challenge');
  const phoneNumber = '+1 (***) ***-****'; // TODO: get from state
  const scrubbedPhoneNumber = getScrubbedPhoneNumber({
    phoneNumber,
  });

  const handleSubmit = () => {
    // TODO: Implement
    onDone();
  };

  // TODO: Title can be "welcome back" or "enter code" depending on state
  // TODO: User can have option to choose a different method of verification
  return (
    <Container>
      <Header
        title={t('title')}
        subtitle={t('subtitle', { scrubbedPhoneNumber })}
      />
      <PinInput autoFocus onComplete={handleSubmit} />
    </Container>
  );
};

export default SmsChallenge;
