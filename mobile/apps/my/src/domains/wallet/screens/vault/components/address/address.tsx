import { IcoBuilding24 } from '@onefootprint/icons';
import { Box, LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';

import Fieldset from '../fieldset';

const Address = () => {
  return (
    <Fieldset title="Address data" iconComponent={IcoBuilding24}>
      <Box>
        <Typography variant="body-3">••••••••••••••••••</Typography>
        <Typography variant="body-3">•••••••••</Typography>
      </Box>
      <Box alignItems="flex-start">
        <LinkButton>Reveal</LinkButton>
      </Box>
    </Fieldset>
  );
};

export default Address;
