import { IcoSpinner16, IcoSpinner24 } from '@onefootprint/icons';
import type { Color } from '@onefootprint/themes';
import React from 'react';
import styled, { keyframes } from 'styled-components';

export type LoadingIndicatorProps = {
  'aria-label'?: string;
  color?: Color;
  size?: 'default' | 'compact';
  testID?: string;
};

const LoadingIndicator = ({
  'aria-label': ariaLabel = 'Loading...',
  color = 'primary',
  size = 'default',
  testID,
}: LoadingIndicatorProps) => (
  <Container data-testid={testID} aria-label={ariaLabel} role="progressbar">
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
