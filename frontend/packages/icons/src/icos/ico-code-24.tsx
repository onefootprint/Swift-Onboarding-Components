import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCode24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.542 9.5 8.63 11.41a.833.833 0 0 0 0 1.18l1.91 1.91m2.917-5 1.911 1.91a.833.833 0 0 1 0 1.18l-1.91 1.91m-7.5 4.375h12.083c.46 0 .833-.373.833-.833V5.958a.833.833 0 0 0-.833-.833H5.958a.833.833 0 0 0-.833.833v12.084c0 .46.373.833.833.833Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoCode24;
