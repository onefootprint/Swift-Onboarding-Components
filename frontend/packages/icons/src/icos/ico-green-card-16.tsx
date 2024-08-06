import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoGreenCard16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M4.5 10.167h3m2.334 0H11.5M4.5 7.5h1m2.333 0H11.5m-9-4.333h11c.368 0 .667.298.667.666v8.334a.667.667 0 0 1-.667.666h-11a.667.667 0 0 1-.667-.666V3.833c0-.368.299-.666.667-.666Z"
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
export default IcoGreenCard16;
