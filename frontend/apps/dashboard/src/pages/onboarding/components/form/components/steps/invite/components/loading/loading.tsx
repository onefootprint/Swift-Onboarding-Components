import { Box, Portal, Shimmer } from '@onefootprint/ui';
import React from 'react';

const Loading = () => (
  <Box aria-busy testID="onboarding-invite-loading">
    <Box sx={{ display: 'flex', gap: 4, marginBottom: 5 }}>
      <Box
        id="email-shimmer"
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <Shimmer sx={{ height: '20px', width: '92px' }} />
        <Shimmer sx={{ height: '40px', width: '294px' }} />
      </Box>
      <Box
        id="roles-shimmer"
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <Shimmer sx={{ height: '20px', width: '28px' }} />
        <Shimmer sx={{ height: '40px', width: '144px' }} />
      </Box>
    </Box>
    <Box id="add-more-button-shimmer">
      <Shimmer sx={{ height: '21px', width: '86px' }} />
    </Box>
    <Portal selector="#onboarding-cta-portal">
      <Box id="submit-button-shimmer" sx={{ display: 'flex', gap: 7 }}>
        <Shimmer sx={{ height: '40px', width: '32px' }} />
        <Shimmer sx={{ height: '40px', width: '120px' }} />
      </Box>
    </Portal>
  </Box>
);

export default Loading;
