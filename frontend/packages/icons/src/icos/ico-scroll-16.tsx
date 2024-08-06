import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoScroll16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M5.833 14.167h-2a.667.667 0 0 1-.667-.667v-11c0-.368.299-.667.667-.667h4.39c.177 0 .347.07.472.196l3.943 3.942a.667.667 0 0 1 .195.472V13.5a.667.667 0 0 1-.667.667h-2m-1.666-12V5.5c0 .368.298.667.666.667H12.5m-4.5 3v4.166m0 0 1.666-1.666M8 13.333l-1.667-1.666"
          stroke={theme.color[color]}
          strokeWidth={1.3}
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
export default IcoScroll16;
