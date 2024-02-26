import { Box, Shimmer, Stack } from '@onefootprint/ui';
import React from 'react';

const Loading = () => (
  <Box testID="members-roles-loading" width="100%">
    <Stack gap={4} marginBottom={5}>
      <Stack direction="column" gap={3}>
        <SecretKeyLabel />
        <SecretKeyInput />
      </Stack>
      <Stack direction="column" gap={3}>
        <RoleLabel />
        <RoleInput />
      </Stack>
    </Stack>
  </Box>
);

const SecretKeyLabel = () => <Shimmer sx={{ height: '20px', width: '110' }} />;

const SecretKeyInput = () => (
  <Shimmer sx={{ height: '40px', width: '395px' }} />
);

const RoleLabel = () => <Shimmer sx={{ height: '20px', width: '99px' }} />;

const RoleInput = () => <Shimmer sx={{ height: '40px', width: '194px' }} />;

export default Loading;
