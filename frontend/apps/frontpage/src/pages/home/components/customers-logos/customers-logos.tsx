import { useTranslation } from '@onefootprint/hooks';
import { IcoSparkles40 } from '@onefootprint/icons';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';

import Logos from './logos';

const CustomersLogos = () => {
  const { t } = useTranslation('pages.home.customers-logos');
  return (
    <Stack direction="column" gap={9} align="center">
      <Stack
        direction="column"
        gap={6}
        align="center"
        maxWidth="540px"
        textAlign="center"
      >
        <IcoSparkles40 color="secondary" />
        <Typography variant="display-4">{t('title')}</Typography>
      </Stack>
      <Logos />
    </Stack>
  );
};

export default CustomersLogos;
