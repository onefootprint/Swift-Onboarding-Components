import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWork24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.458 7.625H5.125a.833.833 0 0 0-.833.833v9.584c0 .46.373.833.833.833h13.75c.46 0 .833-.373.833-.833V8.458a.833.833 0 0 0-.833-.833H15.54m-7.083 0v-2.5c0-.46.373-.833.833-.833h5.417c.46 0 .833.373.833.833v2.5m-7.083 0h7.083"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoWork24;
