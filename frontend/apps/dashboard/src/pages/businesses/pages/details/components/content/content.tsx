import { Box, Divider } from '@onefootprint/ui';
import React from 'react';

import { Breadcrumb, Header, Vault } from './components';

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
    <Vault />
  </Box>
);

export default Content;
