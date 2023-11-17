import {
  Box,
  Button,
  Container,
  DismissKeyboard,
  TextInput,
  Typography,
} from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

export type EmailIdentificationProps = {
  onDone: () => void;
};

const EmailIdentification = ({ onDone }) => {
  const { t } = useTranslation('pages.email-identification');

  const handleSubmit = () => {
    // TODO: Implement
    onDone();
  };

  return (
    <Container>
      <DismissKeyboard>
        <Box gap={3} marginBottom={7}>
          <Typography color="primary" variant="heading-3" center>
            {t('title')}
          </Typography>
          <Typography color="primary" variant="body-2" center>
            {t('subtitle')}
          </Typography>
        </Box>
        <Box marginBottom={7}>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            blurOnSubmit
            enterKeyHint="send"
            inputMode="email"
            label={t('email-input.label')}
            onSubmitEditing={handleSubmit}
            placeholder={t('email-input.placeholder')}
            private
            textContentType="emailAddress"
          />
        </Box>
        <Button variant="primary" onPress={handleSubmit}>
          {t('cta')}
        </Button>
      </DismissKeyboard>
    </Container>
  );
};

export default EmailIdentification;
