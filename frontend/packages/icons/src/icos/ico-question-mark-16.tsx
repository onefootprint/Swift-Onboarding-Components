import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoQuestionMark16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M6.193 5.31a2.015 2.015 0 0 1 2.93-.778 2.017 2.017 0 0 1 .293 3.112c-.449.442-.994.919-1.257 1.48M8 11.81v.01m0 2.68A6.5 6.5 0 1 1 8 1.502 6.5 6.5 0 0 1 8 14.5Z"
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
export default IcoQuestionMark16;
