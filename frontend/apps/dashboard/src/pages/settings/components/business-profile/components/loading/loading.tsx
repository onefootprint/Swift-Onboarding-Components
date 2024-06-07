import { Box, Grid, Shimmer } from '@onefootprint/ui';
import React from 'react';

const Loading = () => (
  <Box testID="business-profile-loading">
    <Box marginBottom={9}>
      <Avatar />
    </Box>
    <Grid.Container gap={2}>
      <Label />
      <Value />
    </Grid.Container>
  </Box>
);

const Avatar = () => <Shimmer height="40px" width="40px" borderRadius="default" />;

const Label = () => <Shimmer height="24px" width="143px" borderRadius="default" />;

const Value = () => <Shimmer height="20px" width="168px" borderRadius="default" />;

export default Loading;
