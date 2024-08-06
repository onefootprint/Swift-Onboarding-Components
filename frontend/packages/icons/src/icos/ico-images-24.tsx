import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoImages24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m5.333 13.842 2.371-1.774a1.667 1.667 0 0 1 2.146.253c1.244 1.34 2.686 2.557 4.65 2.557 1.81 0 3.01-.67 4.167-1.827M5.958 18.875h12.084c.46 0 .833-.373.833-.833V5.958a.833.833 0 0 0-.833-.833H5.958a.833.833 0 0 0-.833.833v12.084c0 .46.373.833.833.833Zm10.417-9.583a1.667 1.667 0 1 1-3.333 0 1.667 1.667 0 0 1 3.333 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
};
export default IcoImages24;
