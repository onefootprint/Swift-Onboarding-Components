import { Box, Divider, Shimmer } from '@onefootprint/ui';
import React from 'react';

const Loading = () => (
  <Box as="section" testID="entity-loading">
    <Box sx={{ marginBottom: 7 }}>
      <Breadcrumb />
    </Box>
    <Box sx={{ marginBottom: 5 }}>
      <Header />
    </Box>
    <Box sx={{ marginBottom: 5 }}>
      <Divider />
    </Box>
    <Box sx={{ marginBottom: 9 }}>
      <Vault />
    </Box>
  </Box>
);

const Breadcrumb = () => (
  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
    <Shimmer sx={{ width: '76px', height: '20px' }} />
    <Shimmer sx={{ width: '6px', height: '20px' }} />
    <Shimmer sx={{ width: '48px', height: '20px' }} />
  </Box>
);

const Header = () => (
  <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        gap: 3,
      }}
    >
      <Box id="entity-kind">
        <Shimmer sx={{ height: '28px', width: '105px' }} />
      </Box>
      <Box id="entity-status">
        <Shimmer
          sx={{ height: '24px', width: '64px', borderRadius: 'large' }}
        />
      </Box>
    </Box>
    <Box
      id="subheader"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 3,
        height: '32px',
        justifyContent: 'space-between',
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'row',
          gap: 3,
        }}
      >
        <Box id="entity-timestamp">
          <Shimmer sx={{ height: '20px', width: '105px' }} />
        </Box>
        <Box>
          <Shimmer sx={{ height: '3px', width: '3px' }} />
        </Box>
        <Box id="entity-id">
          <Shimmer sx={{ height: '26px', width: '253px' }} />
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          gap: 3,
        }}
      >
        <Shimmer sx={{ height: '32px', width: '114px' }} />
        <Shimmer sx={{ height: '32px', width: '114px' }} />
      </Box>
    </Box>
  </Box>
);

const Vault = () => (
  <Box sx={{ display: 'grid', gap: 5, gridTemplateColumns: 'repeat(2, 1fr)' }}>
    <Box>
      <Shimmer sx={{ height: '317px', width: '632px' }} />
    </Box>
    <Box>
      <Shimmer sx={{ height: '317px', width: '632px' }} />
    </Box>
    <Box>
      <Shimmer sx={{ height: '235px', width: '632px' }} />
    </Box>
    <Box>
      <Shimmer sx={{ height: '235px', width: '632px' }} />
    </Box>
  </Box>
);

export default Loading;
