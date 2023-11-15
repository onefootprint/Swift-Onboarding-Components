import {
  Box,
  Button,
  Container,
  TextInput,
  Typography,
} from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

const EmailIdentification = () => {
  const { t } = useTranslation('pages.email-identification');
  return (
    <Container>
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
          label={t('email-input.label')}
          placeholder={t('email-input.placeholder')}
        />
      </Box>
      <Button variant="primary">{t('cta')}</Button>
    </Container>
  );
};

export default EmailIdentification;
