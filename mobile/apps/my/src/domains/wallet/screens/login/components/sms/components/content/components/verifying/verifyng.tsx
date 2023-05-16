import { Box, LoadingIndicator, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

const Verifying = () => {
  const { t } = useTranslation('screens.login.sms');

  return (
    <Box center gap={8} marginTop={8}>
      <LoadingIndicator />
      <Typography variant="label-3">{t('verifying')}</Typography>
    </Box>
  );
};

export default Verifying;
