import { Shimmer, Stack } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

const Loading = () => (
  <Stack testID="onboarding-configs-details-loading" aria-busy>
    <Container>
      <Name />
    </Container>
    {/* more tk as more fields go in here */}
  </Stack>
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
  <Stack>
    <Stack justify="space-between">
      <Shimmer sx={{ width: '228px', height: '20px', marginBottom: 3 }} />
      <Shimmer sx={{ width: '28px', height: '20px', marginBottom: 3 }} />
    </Stack>
    <Shimmer sx={{ width: '100px', height: '20px' }} />
  </Stack>
);

export default Loading;
