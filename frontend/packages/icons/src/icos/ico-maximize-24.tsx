import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoMaximize24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M4.75 14.785v4.465m0 0 5.457-5.457M4.75 19.25h4.504M19.25 9.215V4.75m0 0-5.457 5.457M19.25 4.75h-4.504"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoMaximize24;
