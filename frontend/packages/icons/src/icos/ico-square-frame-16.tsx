import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSquareFrame16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="M2.5 5.333V3.167c0-.369.298-.667.667-.667h2.166M2.5 10.667v2.166c0 .368.298.667.667.667h2.166m5.334-11h2.166c.368 0 .667.298.667.667v2.166m0 5.334v2.166a.667.667 0 0 1-.667.667h-2.166M6.5 10.167h3a.667.667 0 0 0 .667-.667v-3a.667.667 0 0 0-.667-.667h-3a.667.667 0 0 0-.667.667v3c0 .368.299.667.667.667Z"
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
export default IcoSquareFrame16;
