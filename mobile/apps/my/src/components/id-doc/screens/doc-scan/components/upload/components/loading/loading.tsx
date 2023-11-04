import { Box, LoadingIndicator, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

const Loading = () => {
  const { t } = useTranslation('scan.upload.loading');

  return (
    <Box gap={5}>
      <Box>
        <LoadingIndicator />
      </Box>
      <Box gap={3} center>
        <Typography variant="label-1">{t('title')}</Typography>
        <Typography variant="body-2">{t('description')}</Typography>
      </Box>
    </Box>
  );
};

export default Loading;
