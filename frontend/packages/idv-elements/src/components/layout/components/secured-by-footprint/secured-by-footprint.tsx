import { IcoFootprintShield16 } from '@onefootprint/icons';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';

const SecuredByFootprint = () => (
  <Stack justify="center" align="center">
    <IcoFootprintShield16 color="secondary" />
    <Stack marginLeft={2}>
      <Typography variant="caption-1" color="secondary">
        Secured by Footprint
      </Typography>
    </Stack>
  </Stack>
);

export default SecuredByFootprint;
