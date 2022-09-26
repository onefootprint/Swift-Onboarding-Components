import React from 'react';
import styled, { css } from 'styled-components';
import { Box, Divider, Shimmer } from 'ui';

const UserDetailsLoading = () => (
  <Box>
    <header>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'row',
          gap: 3,
          marginBottom: 3,
        }}
      >
        <Box id="title">
          <Shimmer sx={{ height: '28px', width: '75px' }} />
        </Box>
        <Box id="user-status">
          <Shimmer sx={{ height: '24px', width: '64px', borderRadius: 3 }} />
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 3,
          justifyContent: 'space-between',
          marginBottom: 3,
        }}
      >
        <Box
          id="date-and-key"
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            gap: 3,
          }}
        >
          <Shimmer sx={{ height: '28px', width: '112px' }} />
          <Shimmer sx={{ height: '28px', width: '245px' }} />
        </Box>
        <Box id="decrypt-button">
          <Shimmer sx={{ height: '28px', width: '114px' }} />
        </Box>
      </Box>
    </header>
    <Box
      sx={{
        marginY: 5,
      }}
    >
      <Divider />
    </Box>
    <Grid>
      <Box id="basic-data">
        <Shimmer sx={{ height: '159px', width: '632px' }} />
      </Box>
      <Box id="identity-data">
        <Shimmer sx={{ height: '159px', width: '632px' }} />
      </Box>
      <Box id="address-data">
        <Shimmer sx={{ height: '255px', width: '632px' }} />
      </Box>
    </Grid>
  </Box>
);

const Grid = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]}px;
    grid-template: auto auto / repeat(2, minmax(0, 1fr));
  `};
`;

export default UserDetailsLoading;
