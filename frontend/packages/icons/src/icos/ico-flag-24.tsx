import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFlag24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.75 19.25v-6m0 0v-7.5S8.5 3.5 12 5.75s6.25 0 6.25 0v7.5s-2.75 2.25-6.25 0-6.25 0-6.25 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoFlag24;
