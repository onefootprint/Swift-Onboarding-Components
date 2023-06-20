import themes from '@onefootprint/design-tokens';
import { Box, DesignSystemProvider, Typography } from '@onefootprint/ui';
import React from 'react';

const Router = () => {
  return (
    <DesignSystemProvider theme={themes.light}>
      <Box center flex={1}>
        <Typography variant="body-2">Hello world from the router!!</Typography>
      </Box>
    </DesignSystemProvider>
  );
};

export default Router;
