import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDownload16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M13.5 9.833v3a.667.667 0 0 1-.667.667H3.167a.667.667 0 0 1-.667-.667v-3M8 10V2.5M8 10 5.667 7.667M8 10l2.333-2.333"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoDownload16;
