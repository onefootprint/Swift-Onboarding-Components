import { Box, Text } from '@onefootprint/ui';
import React from 'react';

const Success = () => (
  <Box>
    <Text color="primary" marginBottom={7} variant="heading-2">
      Onboarding complete!
    </Text>
    <Text color="secondary" variant="body-1" tag="div">
      Thanks for trying Footprint. If you have any questions or want to learn more about our product, please contact us
      and we will get back to you as soon as possible.
    </Text>
  </Box>
);

export default Success;
