import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPassport24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.917 15.333h4.166m0-4.583a2.083 2.083 0 1 1-4.166 0 2.083 2.083 0 0 1 4.166 0Zm-7.5 8.333h10.834c.46 0 .833-.373.833-.833V5.75a.833.833 0 0 0-.833-.833H6.583a.833.833 0 0 0-.833.833v12.5c0 .46.373.833.833.833Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoPassport24;
