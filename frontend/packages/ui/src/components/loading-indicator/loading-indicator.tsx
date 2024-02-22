import type { Color } from '@onefootprint/design-tokens';
import { IcoSpinner16, IcoSpinner24 } from '@onefootprint/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';

export type LoadingIndicatorProps = {
  'aria-label'?: string;
  color?: Color;
  size?: 'default' | 'compact';
  testID?: string;
};

const LoadingIndicator = ({
  'aria-label': ariaLabel,
  color = 'primary',
  size = 'default',
  testID,
}: LoadingIndicatorProps) => {
  const { t } = useTranslation('ui');

  return (
    <Container
      data-testid={testID}
      aria-label={
        ariaLabel ?? t('components.loading-indicator.aria-label-default')
      }
      role="progressbar"
    >
      {size === 'default' ? (
        <IcoSpinner24 color={color} />
      ) : (
        <IcoSpinner16 color={color} />
      )}
    </Container>
  );
};

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
