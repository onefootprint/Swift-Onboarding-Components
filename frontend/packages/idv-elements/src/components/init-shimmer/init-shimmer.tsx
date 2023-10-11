import styled, { css } from '@onefootprint/styled';
import { Box, Shimmer } from '@onefootprint/ui';
import React from 'react';

const InitShimmer = () => (
  <Box testID="init-shimmer" paddingTop={7}>
    <TitleContainer>
      <Title />
      <Subtitle />
    </TitleContainer>
    <Box marginBottom={7}>
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
    margin-bottom: ${theme.spacing[8]};
  `}
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

const TermsOfService = () => <Shimmer sx={{ width: '100%', height: '16px' }} />;

export default InitShimmer;
