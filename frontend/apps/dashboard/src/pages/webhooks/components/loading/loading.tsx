import { AnimatedLoadingSpinner, Box } from '@onefootprint/ui';
import React from 'react';

const Loading = () => (
  <Box marginTop={12} center>
    <AnimatedLoadingSpinner animationStart />
  </Box>
);

export default Loading;
