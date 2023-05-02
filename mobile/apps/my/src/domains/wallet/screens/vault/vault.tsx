import { Box, Container, InlineAlert, Typography } from '@onefootprint/ui';
import * as Linking from 'expo-linking';
import React from 'react';

import Address from './components/address';
import Basic from './components/basic';
import Identity from './components/identity';

const Vault = () => {
  const handleBannerPress = () => {
    Linking.openURL('https://onefootprint.com/privacy-policy');
  };

  return (
    <Container scroll>
      <Typography variant="body-2" color="secondary" marginBottom={7}>
        All the information in your Footprint Vault.
      </Typography>
      <Box marginBottom={7}>
        <InlineAlert onPress={handleBannerPress}>
          How’s this data collected & secured?
        </InlineAlert>
      </Box>
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
