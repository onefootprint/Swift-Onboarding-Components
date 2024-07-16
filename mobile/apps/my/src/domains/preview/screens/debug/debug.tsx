import { Box, Container, Typography } from '@onefootprint/ui';
import React from 'react';
import { getBuildNumber, getVersion } from 'react-native-device-info';

const Debug = () => {
  return (
    <Container center>
      <Box>
        <Typography variant="body-3">API URL: {process.env.API_BASE_URL ?? 'https://api.onefootprint.com'}</Typography>
      </Box>
      <Box>
        <Typography variant="body-3">Version: {getVersion()} </Typography>
      </Box>
      <Box>
        <Typography variant="body-3">Build number: {getBuildNumber()} </Typography>
      </Box>
    </Container>
  );
};

export default Debug;
