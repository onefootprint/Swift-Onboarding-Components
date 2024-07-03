import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFootprint16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M10.67 10h2.666V7.64a2.666 2.666 0 1 1 0-4.614V0H2.67v16h4.667v-2.666A3.333 3.333 0 0 1 10.67 10Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFootprint16;
