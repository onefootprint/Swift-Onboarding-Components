import { Box, Shimmer } from '@onefootprint/ui';
import React from 'react';

const Loading = () => (
  <Box aria-busy display="flex" justifyContent="space-between">
    <Shimmer height="20px" width="122px" />
    <Shimmer height="20px" width="78px" />
  </Box>
);

export default Loading;
