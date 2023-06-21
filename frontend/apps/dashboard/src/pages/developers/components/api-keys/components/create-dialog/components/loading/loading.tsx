import { Box, Shimmer } from '@onefootprint/ui';
import React from 'react';

const Loading = () => (
  <Box testID="members-roles-loading" sx={{ width: '100%' }}>
    <Box sx={{ display: 'flex', gap: 4, marginBottom: 5 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <SecretKeyLabel />
        <SecretKeyInput />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <RoleLabel />
        <RoleInput />
      </Box>
    </Box>
  </Box>
);

const SecretKeyLabel = () => <Shimmer sx={{ height: '20px', width: '110' }} />;

const SecretKeyInput = () => (
  <Shimmer sx={{ height: '40px', width: '395px' }} />
);

const RoleLabel = () => <Shimmer sx={{ height: '20px', width: '99px' }} />;

const RoleInput = () => <Shimmer sx={{ height: '40px', width: '194px' }} />;

export default Loading;
