import { Box, Shimmer, Stack } from '@onefootprint/ui';
import React, { Fragment } from 'react';

const Loading = () => (
  <Box tag="section" testID="match-signal-loading">
    {[...Array(5).keys()].map(value => (
      <Fragment key={value}>
        <Box marginBottom={2} marginLeft={13}>
          <Header />
        </Box>
        <Box marginBottom={4} marginLeft={13}>
          <Content />
        </Box>
      </Fragment>
    ))}
  </Box>
);

const Header = () => (
  <Stack gap={2} justify="space-between">
    <Shimmer sx={{ height: '25px', width: '150px' }} />
    <Shimmer sx={{ height: '25px', width: '150px' }} />
  </Stack>
);

const Content = () => (
  <Box id="match-description">
    <Shimmer sx={{ height: '25px', marginLeft: 10, marginBottom: 2 }} />
    <Shimmer sx={{ height: '25px', marginLeft: 10, marginBottom: 2 }} />
    <Shimmer sx={{ height: '25px', marginLeft: 10, marginBottom: 7 }} />
  </Box>
);

export default Loading;
