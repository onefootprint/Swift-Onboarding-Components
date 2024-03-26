import { Box } from '@onefootprint/ui';
import React from 'react';

import ActivityLog from './components/activity-log';
import Breadcrumb from './components/breadcrumb';
import Entries from './components/entries';
import Header from './components/header';
import Playbooks from './components/playbooks';

const Content = () => (
  <Box tag="section" testID="entity-content">
    <Box marginBottom={7}>
      <Breadcrumb />
    </Box>
    <Box marginBottom={5}>
      <Header />
    </Box>
    <Box marginBottom={5}>
      <Entries />
    </Box>
    <Box marginBottom={9}>
      <Playbooks />
    </Box>
    <Box marginBottom={9}>
      <ActivityLog />
    </Box>
  </Box>
);

export default Content;
