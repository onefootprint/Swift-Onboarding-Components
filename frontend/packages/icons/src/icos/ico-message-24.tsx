import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoMessage24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M20.125 12c0-4.297-3.16-6.875-8.125-6.875S3.875 7.703 3.875 12c0 1.114.767 3.005.887 3.293.01.026.022.05.031.076.083.226.421 1.425-.918 3.2 1.806.86 3.723-.553 3.723-.553 1.327.7 2.905.859 4.402.859 4.965 0 8.125-2.578 8.125-6.875Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <path
        d="M7.625 12a.625.625 0 1 0 1.25 0 .625.625 0 0 0-1.25 0Zm3.75 0a.625.625 0 1 0 1.25 0 .625.625 0 0 0-1.25 0Zm3.75 0a.625.625 0 1 0 1.25 0 .625.625 0 0 0-1.25 0Z"
        fill={theme.color[color]}
        stroke={theme.color[color]}
        strokeWidth={0.417}
        strokeLinecap="square"
      />
    </svg>
  );
};
export default IcoMessage24;
