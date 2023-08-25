import { IcoCheckCircle40 } from '@onefootprint/icons';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

const Success = () => {
  const { t } = useTranslation('components.liveness.success');

  return (
    <Box
      width="100%"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      marginTop={8}
      gap={2}
    >
      <IcoCheckCircle40 color="success" />
      <Typography variant="label-3" color="success">
        {t('title')}
      </Typography>
    </Box>
  );
};

export default Success;
