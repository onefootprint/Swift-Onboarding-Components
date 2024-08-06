import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoUserCircle40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 40 40"
    >
      <path
        d="M10.193 31.35c2.216-2.86 5.641-4.683 9.807-4.683s7.59 1.823 9.807 4.683m-19.614 0A14.942 14.942 0 0 0 20 35c3.75 0 7.177-1.376 9.807-3.65m-19.614 0A14.966 14.966 0 0 1 5 20c0-8.284 6.716-15 15-15 8.284 0 15 6.716 15 15 0 4.535-2.013 8.6-5.193 11.35M25 16.668a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"
        stroke={theme.color[color]}
        strokeWidth={3.333}
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoUserCircle40;
