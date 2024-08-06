import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoMinimize24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 24 24"
    >
      <path
        d="M13.667 5.333v5m0 0h5m-5 0 5.208-5.208m-8.542 13.542v-5m0 0h-5m5 0-5.208 5.208"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoMinimize24;
