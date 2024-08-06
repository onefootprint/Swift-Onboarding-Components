import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoReturn24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.534 14.292a6.875 6.875 0 1 0 6.484-9.167c-2.348 0-3.917 1.004-5.435 2.716m-.625-2.508V8.25c0 .23.187.417.417.417h2.917"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoReturn24;
