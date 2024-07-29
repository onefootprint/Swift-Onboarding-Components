import { Box, Shimmer } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type LoadingProps = { children?: JSX.Element | null };

const Loading = ({ children }: LoadingProps): JSX.Element => (
  <Box>
    <NavHeader />
    <TitleContainer>
      <Shimmer height="28px" width="272px" marginBottom={5} />
      <Shimmer height="70px" width="340px" />
    </TitleContainer>
    <Box marginBottom={5}>
      <Shimmer height="331px" width="100%" />
    </Box>
    {children}
  </Box>
);

const TitleContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-bottom: ${theme.spacing[8]};
  `}
`;

const NavHeader = styled.div`
  width: 100%;
  height: var(--navigation-header-height);
`;

export default Loading;
