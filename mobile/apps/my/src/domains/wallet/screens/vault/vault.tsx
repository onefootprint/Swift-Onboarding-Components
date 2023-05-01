import { Box, Container, Typography } from '@onefootprint/ui';
import React from 'react';

const Vault = () => {
  return (
    <Container>
      <Typography variant="body-2">
        All the information in your Footprint Vault.
      </Typography>
      <Box>
        <Typography variant="body-2">
          How’s this data collected & secured?
        </Typography>
      </Box>
    </Container>
  );
};

export default Vault;
