import IcoSpinner16 from 'icons/ico/ico-spinner-16';
import IcoSpinner24 from 'icons/ico/ico-spinner-24';
import React from 'react';
import styled, { Colors, keyframes } from 'styled';

export type LoadingIndicatorProps = {
  color?: Colors;
  size?: 'default' | 'compact';
  testID?: string;
};

const LoadingIndicator = ({
  color = 'primary',
  size = 'default',
  testID,
}: LoadingIndicatorProps) => (
  <Container data-testid={testID}>
    {size === 'default' ? (
      <IcoSpinner24 color={color} />
    ) : (
      <IcoSpinner16 color={color} />
    )}
  </Container>
);

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Container = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;

  svg {
    animation: ${rotate} 0.8s linear infinite;
  }
`;

export default LoadingIndicator;
