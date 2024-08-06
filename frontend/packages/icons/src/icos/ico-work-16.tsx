import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWork16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M5.167 4.5H2.5a.667.667 0 0 0-.667.667v7.666c0 .368.299.667.667.667h11a.667.667 0 0 0 .667-.667V5.167A.667.667 0 0 0 13.5 4.5h-2.666m-5.667 0v-2c0-.368.298-.667.667-.667h4.333c.368 0 .667.299.667.667v2m-5.667 0h5.667"
          stroke={theme.color[color]}
          strokeWidth={1.5}
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
export default IcoWork16;
