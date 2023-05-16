import { IcoCheckCircle40 } from '@onefootprint/icons';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

const Success = () => {
  const { t } = useTranslation('screens.login.sms');

  return (
    <Box center gap={4} marginTop={8}>
      <IcoCheckCircle40 color="success" />
      <Typography variant="label-3" color="success">
        {t('success')}
      </Typography>
    </Box>
  );
};

export default Success;
