import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

const Loading = () => (
  <Container>
    <LoadingIndicator />
  </Container>
);

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: var(--loading-container-min-height);
`;

export default Loading;
