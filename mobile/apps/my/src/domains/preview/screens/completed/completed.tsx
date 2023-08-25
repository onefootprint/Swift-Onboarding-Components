import { IcoCheckCircle40 } from '@onefootprint/icons';
import { Box, Container, LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

const Completed = ({ onDone }) => {
  const { t } = useTranslation('screens.completed-preview');

  return (
    <Container center>
      <IcoCheckCircle40 color="success" />
      <Typography variant="heading-3" marginBottom={3} marginTop={4}>
        {t('title')}
      </Typography>
      <Typography variant="body-3" center>
        {t('subtitle')}
      </Typography>
      <Box marginTop={8}>
        <LinkButton size="default" onPress={onDone}>
          {t('cta')}
        </LinkButton>
      </Box>
    </Container>
  );
};

export default Completed;
