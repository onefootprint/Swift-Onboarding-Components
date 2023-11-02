import { IcoCheckCircle40 } from '@onefootprint/icons';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

const Success = () => {
  const { t } = useTranslation('scan.upload.success');

  return (
    <Box gap={4} center>
      <IcoCheckCircle40 color="success" />
      <Typography variant="label-1" color="success">
        {t('title')}
      </Typography>
    </Box>
  );
};

export default Success;
