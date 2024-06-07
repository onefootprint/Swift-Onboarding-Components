import { Box, Divider, Shimmer, Stack } from '@onefootprint/ui';
import React from 'react';

const Loading = () => (
  <Box tag="section" testID="entity-loading" paddingTop={7}>
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
    <Shimmer height="20px" width="76px" />
    <Shimmer height="20px" width="6px" />
    <Shimmer height="20px" width="48px" />
  </Stack>
);

const Header = () => (
  <Stack gap={2} direction="column">
    <Stack align="center" direction="row" gap={3}>
      <Box id="entity-kind">
        <Shimmer height="28px" width="105px" />
      </Box>
      <Box id="entity-status">
        <Shimmer height="24px" width="64px" borderRadius="xl" />
      </Box>
    </Stack>
    <Stack id="subheader" direction="row" gap={3} height="32px" justify="space-between">
      <Stack align="center" direction="row" gap={3}>
        <Box id="entity-timestamp">
          <Shimmer height="20px" width="105px" />
        </Box>
        <Box>
          <Shimmer height="3px" width="3px" />
        </Box>
        <Box id="entity-id">
          <Shimmer height="26px" width="253px" />
        </Box>
      </Stack>
      <Stack align="center" gap={3}>
        <Shimmer height="32px" width="114px" />
        <Shimmer height="32px" width="114px" />
      </Stack>
    </Stack>
  </Stack>
);

const Vault = () => (
  <Box gap={5} display="grid" gridTemplateColumns="repeat(2, 1fr)">
    <Box>
      <Shimmer height="317px" minWidth="264px" />
    </Box>
    <Box>
      <Shimmer height="317px" minWidth="264px" />
    </Box>
    <Box>
      <Shimmer height="235px" minWidth="264px" />
    </Box>
    <Box>
      <Shimmer height="235px" minWidth="264px" />
    </Box>
  </Box>
);

export default Loading;
