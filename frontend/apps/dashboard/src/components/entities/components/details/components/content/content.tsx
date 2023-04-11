import { Box, Divider } from '@onefootprint/ui';
import React from 'react';

import {
  AuditTrail,
  Banner,
  Breadcrumb,
  DeviceInsights,
  Header,
  PinnedNotes,
  RiskSignals,
  Vault,
} from './components';

const Content = () => (
  <Box as="section" testID="entity-content">
    <Box sx={{ marginBottom: 7 }}>
      <Banner />
    </Box>
    <Box sx={{ marginBottom: 7 }}>
      <Breadcrumb />
    </Box>
    <Box sx={{ marginBottom: 5 }}>
      <Header />
    </Box>
    <Box sx={{ marginBottom: 5 }}>
      <Divider />
    </Box>
    <Box sx={{ marginBottom: 5 }}>
      <PinnedNotes />
    </Box>
    <Box sx={{ marginBottom: 9 }}>
      <Vault />
    </Box>
    <Box sx={{ marginBottom: 9 }}>
      <AuditTrail />
    </Box>
    <Box sx={{ marginBottom: 9 }}>
      <RiskSignals />
    </Box>
    <DeviceInsights />
  </Box>
);

export default Content;
