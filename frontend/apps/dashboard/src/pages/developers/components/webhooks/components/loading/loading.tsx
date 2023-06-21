import styled, { css } from '@onefootprint/styled';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';

const Loading = () => (
  <Container>
    <LoadingIndicator />
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[12]};
  `}
`;

export default Loading;
