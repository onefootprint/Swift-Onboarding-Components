import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoUserCircle16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
      viewBox="0 0 16 16"
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="M3.905 12.61C4.78 11.332 6.222 10.5 8 10.5c1.779 0 3.22.831 4.095 2.11m-8.19 0A6.144 6.144 0 0 0 8 14.168a6.144 6.144 0 0 0 4.095-1.556m-8.19 0a6.167 6.167 0 1 1 8.19 0m-1.928-5.944a2.167 2.167 0 1 1-4.334 0 2.167 2.167 0 0 1 4.334 0Z"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoUserCircle16;
