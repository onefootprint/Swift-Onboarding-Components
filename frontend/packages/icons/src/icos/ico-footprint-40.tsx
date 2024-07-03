import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFootprint40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M25 23.75h5v-4.425a4.967 4.967 0 0 1-2.5.675 5 5 0 0 1 0-10c.911 0 1.764.248 2.5.674V5H10v30h8.75v-5A6.25 6.25 0 0 1 25 23.75Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFootprint40;
