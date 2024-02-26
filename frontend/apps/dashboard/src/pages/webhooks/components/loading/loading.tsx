import { AnimatedLoadingSpinner } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

const Loading = () => (
  <Container>
    <AnimatedLoadingSpinner animationStart />
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[12]};
  `}
`;

export default Loading;
