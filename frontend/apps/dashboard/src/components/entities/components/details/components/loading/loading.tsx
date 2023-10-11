import { Box, Divider, Shimmer, Stack } from '@onefootprint/ui';
import React from 'react';

const Loading = () => (
  <Box as="section" testID="entity-loading">
    <Box marginBottom={7}>
      <Breadcrumb />
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
  </Box>
);

const Breadcrumb = () => (
  <Stack gap={3}>
    <Shimmer sx={{ width: '76px', height: '20px' }} />
    <Shimmer sx={{ width: '6px', height: '20px' }} />
    <Shimmer sx={{ width: '48px', height: '20px' }} />
  </Stack>
);

const Header = () => (
  <Stack gap={2} direction="column">
    <Stack align="center" direction="row" gap={3}>
      <Box id="entity-kind">
        <Shimmer sx={{ height: '28px', width: '105px' }} />
      </Box>
      <Box id="entity-status">
        <Shimmer
          sx={{ height: '24px', width: '64px', borderRadius: 'large' }}
        />
      </Box>
    </Stack>
    <Stack
      id="subheader"
      direction="row"
      gap={3}
      height="32px"
      justify="space-between"
    >
      <Stack align="center" direction="row" gap={3}>
        <Box id="entity-timestamp">
          <Shimmer sx={{ height: '20px', width: '105px' }} />
        </Box>
        <Box>
          <Shimmer sx={{ height: '3px', width: '3px' }} />
        </Box>
        <Box id="entity-id">
          <Shimmer sx={{ height: '26px', width: '253px' }} />
        </Box>
      </Stack>
      <Stack align="center" gap={3}>
        <Shimmer sx={{ height: '32px', width: '114px' }} />
        <Shimmer sx={{ height: '32px', width: '114px' }} />
      </Stack>
    </Stack>
  </Stack>
);

const Vault = () => (
  <Box gap={5} sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
    <Box>
      <Shimmer sx={{ height: '317px', width: '632px' }} />
    </Box>
    <Box>
      <Shimmer sx={{ height: '317px', width: '632px' }} />
    </Box>
    <Box>
      <Shimmer sx={{ height: '235px', width: '632px' }} />
    </Box>
    <Box>
      <Shimmer sx={{ height: '235px', width: '632px' }} />
    </Box>
  </Box>
);

export default Loading;
