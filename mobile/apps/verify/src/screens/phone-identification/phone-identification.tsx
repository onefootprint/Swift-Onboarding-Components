import { Container } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import Header from '../../components/header';
import EmailPreview from './components/email-preview';
import PhoneNumberInput from './components/phone-number-input';

const PhoneIdentification = () => {
  const { t } = useTranslation('pages.phone-identification');

  return (
    <Container>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <EmailPreview email="test@email.com" />
      <PhoneNumberInput />
    </Container>
  );
};

export default PhoneIdentification;
