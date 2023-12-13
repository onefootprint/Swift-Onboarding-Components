import { IcoCheckCircle40 } from '@onefootprint/icons';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

const Complete = () => {
  const { t } = useTranslation('pages.complete');
  return (
    <Box alignItems="center" gap={7} paddingLeft={7} paddingRight={7}>
      <IcoCheckCircle40 color="success" />
      <Box gap={4}>
        <Typography variant="heading-3" center>
          {t('title')}
        </Typography>
        <Typography variant="body-2" center>
          {t('subtitle')}
        </Typography>
      </Box>
    </Box>
  );
};

export default Complete;
