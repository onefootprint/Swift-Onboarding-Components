import { Box, Divider, Shimmer } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

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
          <Shimmer
            sx={{ height: '24px', width: '64px', borderRadius: 'large' }}
          />
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
        <HeaderActionsButton>
          <Shimmer sx={{ height: '28px', width: '114px' }} />
          <Shimmer sx={{ height: '28px', width: '114px' }} />
        </HeaderActionsButton>
      </Box>
    </header>
    <Box sx={{ marginY: 5 }}>
      <Divider />
    </Box>
    <DataGrid>
      <Box id="basic-data">
        <Shimmer sx={{ height: '204px', width: '632px' }} />
      </Box>
      <Box id="identity-data">
        <Shimmer sx={{ height: '204px', width: '632px' }} />
      </Box>
      <Box
        id="address-data"
        sx={{
          gridArea: '1 / 2 / span 2 / 2',
        }}
      >
        <Shimmer sx={{ height: '424px', width: '632px' }} />
      </Box>
      <Box
        id="id-doc"
        sx={{
          gridArea: '3 / 1 / 3 / 3',
        }}
      >
        <Shimmer sx={{ height: '93px', width: '100%' }} />
      </Box>
    </DataGrid>
  </Box>
);

const DataGrid = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]};
    grid-template-columns: repeat(2, 1fr);
  `};
`;

const HeaderActionsButton = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[3]};
  `};
`;

export default UserDetailsLoading;
