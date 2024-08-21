import { Box } from '@onefootprint/ui';
import type React from 'react';

const Layout = ({ children }: React.PropsWithChildren) => (
  <Box position="relative" left="260px" width="460px">
    {children}
  </Box>
);

export default Layout;
