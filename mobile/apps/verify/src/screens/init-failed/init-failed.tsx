import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

const InitFailed = () => {
  const { t } = useTranslation('pages.init-failed');

  return (
    <Box width="100%">
      <Typography variant="heading-3" marginBottom={3} marginTop={4}>
        {t('title')}
      </Typography>
      <Typography variant="body-3" marginBottom={9} center>
        {t('subtitle')}
      </Typography>
    </Box>
  );
};

export default InitFailed;
