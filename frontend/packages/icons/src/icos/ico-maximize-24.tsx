import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoMaximize24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M13.667 5.333h5v5m-5 0 4.375-4.375m-7.709 7.709-4.375 4.375m-.625-4.375v5h5"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoMaximize24;
