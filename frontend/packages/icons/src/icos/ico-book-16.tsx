import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBook16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M5.833 2.167H3.5a.667.667 0 0 0-.667.666v10.334c0 .368.299.666.667.666h2.333m0-11.666H12.5c.368 0 .667.298.667.666v10.334a.667.667 0 0 1-.667.666H5.833m0-11.666v11.666M8.5 5.167h2m-2 2.666h2"
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
export default IcoBook16;
