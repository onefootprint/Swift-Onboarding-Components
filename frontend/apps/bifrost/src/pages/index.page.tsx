import { useTranslation } from 'hooks';
import React from 'react';
import { Container, Typography } from 'ui';

const Root = () => {
  const { t } = useTranslation('pages.flow');
  return (
    <Container>
      <Typography variant="heading-2" color="primary">
        {t('title')}
      </Typography>
    </Container>
  );
};

export default Root;
