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
  <Box tag="section" testID="entity-content">
    <Box marginBottom={7}>
      <Banner />
    </Box>
    <Box marginBottom={7}>
      <Breadcrumb />
    </Box>
    <Box>
      <PinnedNotes />
    </Box>
    <Box marginBottom={5}>
      <Header />
    </Box>
    <Box marginBottom={5}>
      <Divider />
    </Box>
    <Box marginBottom={9}>
      <Vault />
    </Box>
    <Box marginBottom={9}>
      <AuditTrail />
    </Box>
    <Box marginBottom={9}>
      <RiskSignals />
    </Box>
    <DeviceInsights />
  </Box>
);

export default Content;
