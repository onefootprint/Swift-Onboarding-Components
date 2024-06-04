import { Box, Grid, Shimmer, Stack } from '@onefootprint/ui';
import React from 'react';

const Loading = () => (
  <Box role="progressbar" aria-label="Loading details...">
    <Box id="overview-shimmer" marginBottom={9}>
      <Box id="overview-title" marginBottom={6}>
        <Shimmer width="71px" height="24px" />
      </Box>
      <Box id="data-vendor" marginBottom={7}>
        <Box marginBottom={2}>
          <Shimmer width="87px" height="20px" />
        </Box>
        <Box>
          <Shimmer width="59px" height="20px" />
        </Box>
      </Box>
      <Grid.Container columns={['1fr', '1fr']} gap={3}>
        <Box id="severity" marginBottom={7}>
          <Box marginBottom={2}>
            <Shimmer width="58px" height="20px" />
          </Box>
          <Box>
            <Shimmer width="28px" height="20px" />
          </Box>
        </Box>
        <Box id="scope" marginBottom={7}>
          <Box marginBottom={2}>
            <Shimmer width="45px" height="20px" />
          </Box>
          <Box>
            <Shimmer width="58px" height="20px" />
          </Box>
        </Box>
      </Grid.Container>
      <Box id="note" marginBottom={6}>
        <Box marginBottom={2}>
          <Shimmer width="34px" height="20px" />
        </Box>
        <Box>
          <Shimmer width="139px" height="20px" />
        </Box>
      </Box>
      <Box id="note-details" marginBottom={7}>
        <Box marginBottom={2}>
          <Shimmer width="86px" height="20px" />
        </Box>
        <Box>
          <Shimmer width="452px" height="20px" />
        </Box>
      </Box>
    </Box>
    <Box id="related-signals-shimmer" marginBottom={9}>
      <Box id="related-signals-title-shimmer" marginBottom={6}>
        <Shimmer width="112px" height="24px" />
      </Box>
      <Box id="related-signals-table-shimmer">
        <Shimmer width="452px" height="94px" />
      </Box>
    </Box>
    <Box id="raw-response-shimmer">
      <Stack
        id="raw-response-title-shimmer"
        align="center"
        justify="space-between"
        marginBottom={6}
      >
        <Box>
          <Shimmer width="105px" height="24px" />
        </Box>
        <Box>
          <Shimmer width="33px" height="24px" />
        </Box>
      </Stack>
      <Box>
        <Shimmer width="452px" height="135px" />
      </Box>
    </Box>
  </Box>
);

export default Loading;
