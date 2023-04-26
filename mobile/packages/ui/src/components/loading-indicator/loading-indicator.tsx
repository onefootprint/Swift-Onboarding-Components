import type { Color } from '@onefootprint/design-tokens';
import { useTheme } from '@onefootprint/styled';
import React from 'react';
import { ActivityIndicator } from 'react-native';

export type LoadingIndicatorProps = {
  'aria-label'?: string;
  color?: Color;
};

const LoadingIndicator = ({
  'aria-label': ariaLabel = 'Loading...',
  color = 'primary',
}: LoadingIndicatorProps) => {
  const theme = useTheme();
  return (
    <ActivityIndicator
      aria-label={ariaLabel}
      color={theme.color[color]}
      size="small"
    />
  );
};

export default LoadingIndicator;
