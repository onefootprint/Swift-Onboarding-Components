import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCode16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M6.833 6 5.305 7.529a.667.667 0 0 0 0 .942L6.833 10m2.334-4 1.528 1.529c.26.26.26.682 0 .942L9.167 10m-6 3.5h9.666a.667.667 0 0 0 .667-.667V3.167a.667.667 0 0 0-.667-.667H3.167a.667.667 0 0 0-.667.667v9.666c0 .368.298.667.667.667Z"
          stroke={theme.color[color]}
          strokeWidth={1.4}
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
export default IcoCode16;
