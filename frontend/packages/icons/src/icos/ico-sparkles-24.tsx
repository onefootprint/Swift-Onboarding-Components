import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSparkles24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M15 4.75C15 7.511 13.511 10 10.75 10c2.761 0 4.25 2.489 4.25 5.25 0-2.761 1.489-5.25 4.25-5.25C16.489 10 15 7.511 15 4.75ZM8 12.75C8 14.407 6.407 16 4.75 16 6.407 16 8 17.593 8 19.25 8 17.593 9.593 16 11.25 16 9.593 16 8 14.407 8 12.75Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoSparkles24;
