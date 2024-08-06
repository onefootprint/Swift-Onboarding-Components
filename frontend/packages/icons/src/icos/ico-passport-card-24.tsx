import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPassportCard24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M19.083 6.583v10.834c0 .46-.373.833-.833.833H5.75a.833.833 0 0 1-.833-.833V6.583c0-.46.373-.833.833-.833h12.5c.46 0 .833.373.833.833Z"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.916 15.333h4.167m0-4.583a2.083 2.083 0 1 1-4.167 0 2.083 2.083 0 0 1 4.167 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoPassportCard24;
