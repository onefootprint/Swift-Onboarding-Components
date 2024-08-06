import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFootprint40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
      viewBox="0 0 40 40"
    >
      <path
        d="M24.25 23.188h4.25v-3.761a4.223 4.223 0 0 1-2.125.573 4.25 4.25 0 0 1 0-8.5c.775 0 1.5.21 2.125.573V7.25h-17v25.5h7.437V28.5a5.313 5.313 0 0 1 5.313-5.312Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFootprint40;
