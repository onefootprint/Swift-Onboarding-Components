import { Box } from '@onefootprint/ui';
import React from 'react';

import ActivityLog from './components/activity-log';
import Breadcrumb from './components/breadcrumb';
import Entries from './components/entries';
import Header from './components/header';
import Playbooks from './components/playbooks';

const Content = () => (
  <Box tag="section" testID="list-content">
    <Box marginBottom={7}>
      <Breadcrumb />
    </Box>
    <Box marginBottom={7}>
      <Header />
    </Box>
    <Box marginBottom={7}>
      <Entries />
    </Box>
    <Box marginBottom={7}>
      <Playbooks />
    </Box>
    <Box marginBottom={7}>
      <ActivityLog />
    </Box>
  </Box>
);

export default Content;
