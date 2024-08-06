import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoInfo40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g clipPath="url(#prefix__a)" stroke={theme.color[color]}>
        <path
          d="M18.333 18.333H20v8.334M35 20c0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15 0-8.284 6.716-15 15-15 8.284 0 15 6.716 15 15Z"
          strokeWidth={3.333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 12.083a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"
          fill={theme.color[color]}
          strokeWidth={0.833}
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h40v40H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoInfo40;
