import { AnimatedLoadingSpinner, Box, Shimmer, Stack } from '@onefootprint/ui';
import React from 'react';

const Loading = () => (
  <Box testID="onboarding-configs-details-loading" aria-busy>
    <Breadcrumb />
    <Name />
    <Stack justifyContent="space-between" marginBottom={9}>
      <Stack alignItems="center" gap={4}>
        <Kind />
        <PublicKey />
      </Stack>
      <Box>
        <EditButton />
      </Box>
    </Stack>
    <Stack marginBottom={9} gap={5}>
      <Tabs />
    </Stack>
    <Stack center marginTop={12}>
      <AnimatedLoadingSpinner animationStart size={24} />
    </Stack>
  </Box>
);

const Breadcrumb = () => (
  <Shimmer
    sx={{
      width: '132px',
      height: '20px',
      marginBottom: 8,
    }}
  />
);

const Name = () => (
  <Shimmer
    sx={{
      width: '100px',
      height: '20px',
      marginBottom: 4,
    }}
  />
);

const Kind = () => (
  <Shimmer
    sx={{
      width: '30px',
      height: '20px',
    }}
  />
);

const PublicKey = () => (
  <Shimmer
    sx={{
      width: '264px',
      height: '20px',
    }}
  />
);

const EditButton = () => (
  <Shimmer
    sx={{
      width: '157px',
      height: '20px',
    }}
  />
);

const Tabs = () => (
  <>
    <Shimmer
      sx={{
        width: '105px',
        height: '20px',
      }}
    />
    <Shimmer
      sx={{
        width: '130px',
        height: '20px',
      }}
    />
    <Shimmer
      sx={{
        width: '110px',
        height: '20px',
      }}
    />
    <Shimmer
      sx={{
        width: '37px',
        height: '20px',
      }}
    />
  </>
);

export default Loading;
