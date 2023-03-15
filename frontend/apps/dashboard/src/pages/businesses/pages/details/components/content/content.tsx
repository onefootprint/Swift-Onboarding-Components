import { Box } from '@onefootprint/ui';
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
  <Box as="section" testID="business-content">
    <Notes />
    <Box sx={{ marginBottom: 7 }}>
      <Breadcrumb />
    </Box>
    <Header />
    <Vault />
    <AuditTrail />
    <RiskSignals />
    <DeviceInsights />
  </Box>
);

export default Content;
