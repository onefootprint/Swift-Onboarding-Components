import styled, { css } from '@onefootprint/styled';
import { Box, Shimmer } from '@onefootprint/ui';
import React from 'react';

const Loading = () => (
  <Box testID="onboarding-configs-details-loading" aria-busy>
    <Container>
      <Name />
    </Container>
    <Container>
      <OnboardingDetails />
    </Container>
    <Container>
      <KycDataCollection />
    </Container>
  </Box>
);

const Container = styled.div`
  ${({ theme }) => css`
    &:not(:last-child) {
      border-bottom: 1px solid ${theme.borderColor.tertiary};
      margin-bottom: ${theme.spacing[7]};
      padding-bottom: ${theme.spacing[7]};
    }
  `}
`;

const Name = () => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Shimmer sx={{ width: '228px', height: '20px', marginBottom: 3 }} />
      <Shimmer sx={{ width: '28px', height: '20px', marginBottom: 3 }} />
    </Box>
    <Shimmer sx={{ width: '100px', height: '20px' }} />
  </Box>
);

const OnboardingDetails = () => (
  <Box>
    <Shimmer sx={{ width: '40px', height: '20px', marginBottom: 3 }} />
    <Shimmer sx={{ width: '26px', height: '20px', marginBottom: 6 }} />
    <Shimmer sx={{ width: '110px', height: '20px', marginBottom: 3 }} />
    <Shimmer sx={{ width: '266px', height: '20px' }} />
  </Box>
);

const KycDataCollection = () => (
  <Box>
    <Shimmer sx={{ width: '105px', height: '20px', marginBottom: 3 }} />
    <Shimmer sx={{ width: '300px', height: '26px', marginBottom: 6 }} />
    <Shimmer sx={{ width: '185px', height: '20px', marginBottom: 3 }} />
    <Shimmer sx={{ width: '300px', height: '26px' }} />
  </Box>
);

export default Loading;
