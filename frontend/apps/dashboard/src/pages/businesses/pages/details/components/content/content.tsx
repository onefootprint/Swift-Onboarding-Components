import { Box, Divider } from '@onefootprint/ui';
import React from 'react';

import { Breadcrumb, DeviceInsights, Header, Vault } from './components';

const Content = () => (
  <Box as="section" testID="entity-content">
    <Box sx={{ marginBottom: 7 }}>
      <Breadcrumb />
    </Box>
    <Box sx={{ marginBottom: 5 }}>
      <Header />
    </Box>
    <Box sx={{ marginBottom: 5 }}>
      <Divider />
    </Box>
    <Box sx={{ marginBottom: 9 }}>
      <Vault />
    </Box>
    <DeviceInsights />
  </Box>
);

export default Content;
