import { EntityKind } from '@onefootprint/types';
import { Box, Divider } from '@onefootprint/ui';
import React from 'react';

import { useEntityContext } from '../../hooks/use-entity-context';
import {
  AuditTrail,
  Banner,
  Breadcrumb,
  DeviceInsights,
  Header,
  OtherInsights,
  PinnedNotes,
  RiskSignals,
  Vault,
} from './components';
import DuplicateData from './components/duplicate-data';

const Content = () => {
  const { kind } = useEntityContext();

  return (
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
      {kind === EntityKind.person && (
        <Box marginBottom={9}>
          <DuplicateData />
        </Box>
      )}
      <Box marginBottom={9}>
        <DeviceInsights />
      </Box>
      <OtherInsights />
    </Box>
  );
};

export default Content;
