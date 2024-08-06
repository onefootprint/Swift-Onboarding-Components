import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoConstruct16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M8.5 7.167V2.5c0-.368.299-.667.667-.667h3c.368 0 .667.299.667.667v4.667M8.5 4.5h1.667m-7 2.667V4.168c0-.11.027-.219.08-.316l.928-1.725a.558.558 0 0 1 .983 0l.93 1.725c.051.097.079.206.079.316v2.999m-4.333 0h12.333v5.666a.667.667 0 0 1-.667.667h-11a.667.667 0 0 1-.667-.667V7.167Z"
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
export default IcoConstruct16;
