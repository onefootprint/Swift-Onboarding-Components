import { Box, Divider } from '@onefootprint/ui';
import React from 'react';

import {
  AuditTrail,
  Breadcrumb,
  DeviceInsights,
  Header,
  Notes,
  RiskSignals,
  Vault,
} from './components';

const Content = () => (
  <Box as="section" testID="entity-content">
    <Notes />
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
    <AuditTrail />
    <RiskSignals />
    <DeviceInsights />
  </Box>
);

export default Content;
