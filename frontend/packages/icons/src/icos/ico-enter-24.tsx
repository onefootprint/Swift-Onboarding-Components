import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEnter24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M18.875 5.958v7.917c0 .46-.373.833-.833.833H5.958m2.5-3.333-3.333 3.333 3.333 3.334"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoEnter24;
