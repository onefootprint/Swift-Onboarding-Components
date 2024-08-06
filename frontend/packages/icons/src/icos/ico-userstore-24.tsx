import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoUserstore24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.876 13.043c-3.1.054-5.357 2.138-5.984 4.928-.108.48.28.904.772.904h4.918m.294-5.832.123-.001c.293 0 .58.018.857.053m-.98-.052c-.542.01-1.058.08-1.544.207m2.524-.155c.278.035.548.087.81.155m-.81-.155a6.228 6.228 0 0 1 1.643.437M14.29 17.5l1.834 1.375 2.75-4.583m-3.75-6.875a3.125 3.125 0 1 1-6.25 0 3.125 3.125 0 0 1 6.25 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoUserstore24;
