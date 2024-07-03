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
    >
      <path
        d="M13.793 5.742v4.465m0 0L19.25 4.75m-5.457 5.457h4.503M10.25 18.215V13.75m0 0-5.457 5.457m5.457-5.457H5.746"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoMinimize24;
