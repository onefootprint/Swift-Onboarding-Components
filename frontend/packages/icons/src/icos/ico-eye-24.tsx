import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEye24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M14.77 12a2.77 2.77 0 1 1-5.54 0 2.77 2.77 0 0 1 5.54 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.77 11.164c-4.466-7.504-13.073-7.504-17.54 0a1.635 1.635 0 0 0 0 1.672c4.467 7.504 13.074 7.504 17.54 0a1.635 1.635 0 0 0 0-1.672Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoEye24;
