import themes from '@onefootprint/design-tokens';
import {
  Box,
  Container,
  DesignSystemProvider,
  Typography,
} from '@onefootprint/ui';
import * as Linking from 'expo-linking';
import React from 'react';

type DebugProps = {
  onLoad: () => void;
};

const Debug = ({ onLoad }: DebugProps) => {
  const url = Linking.useURL();

  return (
    <DesignSystemProvider theme={themes.light}>
      <Container>
        <Box onLayout={onLoad}>
          <Typography variant="body-3">
            Base URL: {process.env.API_BASE_URL}
          </Typography>
          <Typography variant="body-3">URL: {url}</Typography>
        </Box>
      </Container>
    </DesignSystemProvider>
  );
};

export default Debug;
