import { Box, Shimmer } from '@onefootprint/ui';
import React from 'react';

const Loading = () => (
  <Box testID="business-profile-loading">
    <Box marginBottom={9}>
      <Avatar />
    </Box>
    <Box sx={{ display: 'grid' }} gap={2}>
      <Label />
      <Value />
    </Box>
  </Box>
);

const Avatar = () => (
  <Shimmer sx={{ width: '40px', height: '40px', borderRadius: 'full' }} />
);

const Label = () => (
  <Shimmer sx={{ width: '143px', height: '24px', borderRadius: 'default' }} />
);

const Value = () => (
  <Shimmer sx={{ width: '168px', height: '20px', borderRadius: 'default' }} />
);

export default Loading;
