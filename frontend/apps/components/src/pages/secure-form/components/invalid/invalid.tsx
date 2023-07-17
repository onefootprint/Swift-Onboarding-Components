import { useTranslation } from '@onefootprint/hooks';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

const Invalid = () => {
  const { t } = useTranslation('pages.secure-form.invalid');

  return (
    <Box sx={{ textAlign: 'center', padding: 3, maxWidth: '500px' }}>
      <Typography as="h2" color="primary" variant="heading-3">
        {t('title')}
      </Typography>
      <Typography
        variant="body-2"
        color="secondary"
        as="h3"
        sx={{ marginTop: 3 }}
      >
        {t('subtitle')}
      </Typography>
    </Box>
  );
};

export default Invalid;
