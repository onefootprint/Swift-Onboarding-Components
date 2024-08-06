import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPassport161 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M6.167 10.833h3.667M10 7a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-6.5 6.833h9a.667.667 0 0 0 .667-.666V2.833a.667.667 0 0 0-.667-.666h-9a.667.667 0 0 0-.667.666v10.334c0 .368.299.666.667.666Z"
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
export default IcoPassport161;
