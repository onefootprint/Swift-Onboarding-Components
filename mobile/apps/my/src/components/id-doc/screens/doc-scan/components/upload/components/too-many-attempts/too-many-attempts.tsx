import { IcoForbid40 } from '@onefootprint/icons';
import { Box, Container, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

const TooManyAttempts = () => {
  const { t } = useTranslation('scan.upload.too-many-attempts');

  return (
    <Container center>
      <Box center marginBottom={7}>
        <IcoForbid40 color="error" />
      </Box>
      <Box gap={3}>
        <Typography center variant="label-1" color="error">
          {t('title')}
        </Typography>
        <Typography center variant="body-2">
          {t('description')}
        </Typography>
      </Box>
    </Container>
  );
};

export default TooManyAttempts;
