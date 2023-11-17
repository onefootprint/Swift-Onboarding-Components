import { Box, Button, Container, TextInput } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import Header from '../../components/header';
import EmailPreview from './components/email-preview';

export type PhoneIdentificationProps = {
  onDone: () => void;
};

const PhoneIdentification = ({ onDone }: PhoneIdentificationProps) => {
  const { t } = useTranslation('pages.phone-identification');

  const handleSubmit = () => {
    // TODO: Implement
    onDone();
  };

  return (
    <Container>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <EmailPreview email="test@email.com" />
      <Box gap={7} marginBottom={7}>
        <TextInput
          // autoFocus
          keyboardType="phone-pad"
          label={t('phone-number-input.label')}
          onSubmitEditing={handleSubmit}
          placeholder={t('phone-number-input.placeholder')}
          private
          textContentType="telephoneNumber"
        />
        <Button variant="primary" onPress={handleSubmit}>
          {t('cta')}
        </Button>
      </Box>
    </Container>
  );
};

export default PhoneIdentification;
