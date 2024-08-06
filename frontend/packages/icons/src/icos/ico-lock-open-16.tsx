import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLockOpen16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M8 9.333v2M5.167 6.5V4.667a2.833 2.833 0 0 1 5.623-.498m-6.957 9.998h8.334a.667.667 0 0 0 .666-.667V7.167a.667.667 0 0 0-.667-.667H3.833a.667.667 0 0 0-.667.667V13.5c0 .368.299.667.667.667Z"
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
export default IcoLockOpen16;
