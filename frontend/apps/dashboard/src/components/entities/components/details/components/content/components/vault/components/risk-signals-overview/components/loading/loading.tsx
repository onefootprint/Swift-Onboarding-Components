import { Box, Shimmer } from '@onefootprint/ui';
import React from 'react';

const Loading = () => (
  <Box aria-busy display="flex" justifyContent="space-between">
    <Shimmer
      sx={{
        width: '122px',
        height: '20px',
      }}
    />
    <Shimmer
      sx={{
        width: '78px',
        height: '20px',
      }}
    />
  </Box>
);

export default Loading;
