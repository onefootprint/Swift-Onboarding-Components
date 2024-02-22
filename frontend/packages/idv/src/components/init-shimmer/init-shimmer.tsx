import { Box, Shimmer } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

const InitShimmer = () => (
  <Box testID="init-shimmer">
    <NavHeader />
    <TitleContainer>
      <Title />
      <Subtitle />
    </TitleContainer>
    <Box marginBottom={5}>
      <Label />
      <Input />
    </Box>
    <Button />
    <TermsOfService />
  </Box>
);

const TitleContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-bottom: ${theme.spacing[3]};
  `}
`;

const NavHeader = styled.div`
  width: 100%;
  height: var(--navigation-header-height);
`;

const Title = () => (
  <Shimmer sx={{ width: '120px', height: '28px', marginBottom: 3 }} />
);

const Subtitle = () => <Shimmer sx={{ width: '228px', height: '24px' }} />;

const Label = () => (
  <Shimmer sx={{ width: '37px', height: '20px', marginBottom: 3 }} />
);

const Input = () => <Shimmer sx={{ width: '100%', height: '40px' }} />;

const Button = () => (
  <Shimmer sx={{ width: '100%', height: '48px', marginBottom: 5 }} />
);

const TermsOfService = () => <Shimmer sx={{ width: '100%', height: '30px' }} />;

export default InitShimmer;
