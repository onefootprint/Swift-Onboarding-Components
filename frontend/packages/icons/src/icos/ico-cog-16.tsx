import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCog16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        <g clipPath="url(#prefix__b)">
          <path
            d="M13.5 8a5.475 5.475 0 0 0-.736-2.75M13.5 8a5.474 5.474 0 0 1-.736 2.75M13.5 8h-4m4 0h1.333m-2.07-2.75 1.155-.667m-1.154.666a5.528 5.528 0 0 0-2.014-2.013m2.014 7.514 1.154.666m-1.154-.666a5.526 5.526 0 0 1-2.014 2.014M9.5 8a1.5 1.5 0 0 1-2.25 1.3M9.5 8a1.5 1.5 0 0 0-2.25-1.3M8 13.5a5.474 5.474 0 0 1-2.75-.736M8 13.5a5.474 5.474 0 0 0 2.75-.736M8 13.5v1.333m-2.75-2.07-.667 1.155m.666-1.154 2-3.465m-2 3.465a5.527 5.527 0 0 1-2.013-2.014m7.514 2.014.666 1.154M2.5 8c0 1.002.268 1.941.736 2.75M2.5 8c0-1.002.268-1.942.736-2.75M2.5 8H1.167m2.069 2.75-1.154.667m1.154-6.168-1.154-.666m1.154.666a5.527 5.527 0 0 1 2.013-2.013M8 2.5a5.475 5.475 0 0 0-2.75.736M8 2.5c1.003 0 1.942.268 2.751.736M8 2.5V1.167M5.25 3.236l-.667-1.154m.666 1.154 2 3.465m3.501-3.465.666-1.154M7.25 9.299a1.5 1.5 0 0 1 0-2.598"
            stroke={theme.color[color]}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
        <clipPath id="prefix__b">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoCog16;
