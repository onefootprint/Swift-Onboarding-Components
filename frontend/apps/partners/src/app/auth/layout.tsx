'use client';

import { Box } from '@onefootprint/ui';
import React from 'react';

const Layout = ({ children }: React.PropsWithChildren) => (
  <Box
    backgroundColor="secondary"
    padding={7}
    width="100%"
    height="100vh"
    alignItems="center"
    justifyContent="center"
    typography="body-1"
  >
    <Box
      backgroundColor="primary"
      borderRadius="default"
      borderWidth={1}
      borderColor="tertiary"
      padding={8}
      elevation={1}
    >
      <Box width="398px">{children}</Box>
    </Box>
  </Box>
);

export default Layout;
