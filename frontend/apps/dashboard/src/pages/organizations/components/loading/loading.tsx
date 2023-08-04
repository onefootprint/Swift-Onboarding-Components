import { useTranslation } from '@onefootprint/hooks';
import { Box, LoadingIndicator, Typography } from '@onefootprint/ui';
import React from 'react';

const Loading = () => {
  const { t } = useTranslation('pages.organizations');

  return (
    <Box testID="organizations-loading" sx={{ width: '100%' }}>
      <Typography
        variant="label-1"
        color="primary"
        sx={{ marginTop: 8, marginBottom: 6, textAlign: 'center' }}
      >
        {t('title')}
      </Typography>
      <LoadingIndicator />
    </Box>
  );
};

export default Loading;
