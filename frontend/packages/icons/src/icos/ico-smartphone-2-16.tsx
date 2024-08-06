import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSmartphone216 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M7.167 3.5h1.667M4.5 14.833h7a.667.667 0 0 0 .667-.666V1.833a.667.667 0 0 0-.667-.666h-7a.667.667 0 0 0-.667.666v12.334c0 .368.299.666.667.666Z"
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
export default IcoSmartphone216;
