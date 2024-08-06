import { Box, Stack } from '@onefootprint/ui';

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
    <Stack direction="column" gap={9}>
      <Entries />
      <Playbooks />
      <ActivityLog />
    </Stack>
  </Box>
);

export default Content;
