import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

const Success = () => (
  <Box>
    <Typography color="primary" sx={{ marginBottom: 7 }} variant="heading-2">
      Onboarding complete!
    </Typography>
    <Typography color="secondary" variant="body-1" as="div">
      Thanks for trying Footprint. If you have any questions or want to learn
      more about our product, please contact us and we will get back to you as
      soon as possible.
    </Typography>
  </Box>
);

export default Success;
