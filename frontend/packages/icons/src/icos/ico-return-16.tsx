import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoReturn16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M2.827 9.833A5.502 5.502 0 0 0 13.514 8a5.5 5.5 0 0 0-5.5-5.5c-1.878 0-3.134.803-4.348 2.173m-.5-2.006V5c0 .184.15.333.334.333h2.333"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinecap="round"
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
export default IcoReturn16;
