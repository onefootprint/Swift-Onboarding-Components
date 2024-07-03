import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSparkles40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M25 7.917c0 4.602-2.481 8.75-7.083 8.75 4.602 0 7.083 4.147 7.083 8.75 0-4.603 2.481-8.75 7.083-8.75-4.602 0-7.083-4.148-7.083-8.75ZM13.333 21.25c0 2.762-2.655 5.417-5.416 5.417 2.761 0 5.416 2.655 5.416 5.416 0-2.761 2.656-5.416 5.417-5.416-2.761 0-5.417-2.655-5.417-5.417Z"
        stroke={theme.color[color]}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoSparkles40;
