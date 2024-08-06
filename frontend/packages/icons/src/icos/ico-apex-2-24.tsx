import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoApex224 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m18.06 17.424-3.124-4.57h-2.921l3.5 5.12c.087.144.202.289.347.375a.95.95 0 0 0 .492.116h1.273c.607-.029.81-.491.433-1.041ZM9.064 12.825 5.94 17.424c-.376.578-.174 1.012.434 1.012h1.272a.95.95 0 0 0 .492-.115.88.88 0 0 0 .347-.376l3.5-5.12H9.065ZM18.06 6.576l-3.124 4.57h-2.921l3.5-5.12c.087-.144.202-.289.347-.375a.95.95 0 0 1 .492-.116h1.273c.607.029.78.492.433 1.041ZM9.064 11.176l-3.124-4.6c-.376-.578-.174-1.012.434-1.012h1.272a.95.95 0 0 1 .492.115.88.88 0 0 1 .347.376l3.5 5.12H9.065Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoApex224;
