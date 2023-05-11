import { Box, Container, Typography } from '@onefootprint/ui';
import React from 'react';

import Address from './components/address';
import Basic from './components/basic';
import Identity from './components/identity';

const Vault = () => {
  return (
    <Container scroll>
      <Typography variant="body-2" marginBottom={7}>
        All the information in your Footprint Vault.
      </Typography>
      <Box marginBottom={4}>
        <Basic />
      </Box>
      <Box marginBottom={4}>
        <Address />
      </Box>
      <Box marginBottom={9}>
        <Identity />
      </Box>
    </Container>
  );
};

export default Vault;
