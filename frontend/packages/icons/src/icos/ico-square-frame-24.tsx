import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSquareFrame24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M5.125 8.667V5.958c0-.46.373-.833.833-.833h2.709M5.125 15.333v2.709c0 .46.373.833.833.833h2.709m6.666-13.75h2.709c.46 0 .833.373.833.833v2.709m0 6.666v2.709c0 .46-.373.833-.833.833h-2.709m-5.208-4.167h3.75c.46 0 .833-.373.833-.833v-3.75a.833.833 0 0 0-.833-.833h-3.75a.833.833 0 0 0-.833.833v3.75c0 .46.373.833.833.833Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoSquareFrame24;
