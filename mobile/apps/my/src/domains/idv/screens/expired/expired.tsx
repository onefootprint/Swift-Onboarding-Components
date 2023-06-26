import { Container, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

const Expired = () => {
  const { t } = useTranslation('screens.expired');

  return (
    <Container center>
      <Typography variant="heading-3" marginBottom={3} marginTop={4}>
        {t('title')}
      </Typography>
      <Typography variant="body-3" marginBottom={9} center>
        {t('subtitle')}
      </Typography>
    </Container>
  );
};

export default Expired;
