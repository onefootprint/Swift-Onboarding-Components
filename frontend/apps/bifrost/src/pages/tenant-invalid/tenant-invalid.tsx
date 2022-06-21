import { useTranslation } from 'hooks';
import React from 'react';
import { Box, Typography } from 'ui';

const TenantInvalid = () => {
  const { t } = useTranslation('pages.tenant-invalid');
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="heading-3" color="primary" sx={{ marginBottom: 3 }}>
        {t('title')}
      </Typography>
      <Typography variant="body-2" color="secondary">
        {t('subtitle')}
      </Typography>
    </Box>
  );
};

export default TenantInvalid;
