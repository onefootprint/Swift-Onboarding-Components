import styled, { css } from '@onefootprint/styled';
import { Box, Shimmer } from '@onefootprint/ui';
import React from 'react';

type BaseLoadingProps = { children?: JSX.Element | null };

const BaseLoading = ({ children }: BaseLoadingProps): JSX.Element => (
  <Box testID="auth-init-shimmer">
    <NavHeader />
    <TitleContainer>
      <Shimmer sx={{ width: '120px', height: '28px', marginBottom: 3 }} />
      <Shimmer sx={{ width: '228px', height: '24px' }} />
    </TitleContainer>
    <Box marginBottom={5}>
      <Shimmer sx={{ width: '37px', height: '20px', marginBottom: 3 }} />
      <Shimmer sx={{ width: '100%', height: '40px' }} />
    </Box>
    <Shimmer sx={{ width: '100%', height: '48px', marginBottom: 5 }} />
    <Shimmer sx={{ width: '100%', height: '30px' }} />
    {children}
  </Box>
);

const TitleContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-bottom: ${theme.spacing[2]};
  `}
`;

const NavHeader = styled.div`
  width: 100%;
  height: var(--navigation-header-height);
`;

export default BaseLoading;
