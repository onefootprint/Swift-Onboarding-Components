import { IcoFootprintShield16 } from '@onefootprint/icons';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

const SecuredByFootprint = () => {
  const { t } = useTranslation('idv');
  return (
    <Stack justify="center" align="center">
      <IcoFootprintShield16 color="secondary" />
      <Stack marginLeft={2}>
        <Typography variant="caption-1" color="secondary">
          {t('global.components.layout.secured-by-footprint')}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default SecuredByFootprint;
