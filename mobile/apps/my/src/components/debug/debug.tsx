import themes from '@onefootprint/design-tokens';
import {
  Box,
  Container,
  DesignSystemProvider,
  Typography,
} from '@onefootprint/ui';
import React from 'react';

import useURL from '@/hooks/use-url';

type DebugProps = {
  onLoad: () => void;
};

const Debug = ({ onLoad }: DebugProps) => {
  const url = useURL();

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
