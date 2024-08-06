import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDotsHorizontal16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g
        clipPath="url(#prefix__a)"
        stroke={theme.color[color]}
        strokeWidth={1.333}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 8.667a.667.667 0 1 0 0-1.334.667.667 0 0 0 0 1.334ZM12 8.667a.667.667 0 1 0 0-1.334.667.667 0 0 0 0 1.334ZM4 8.667a.667.667 0 1 0 0-1.334.667.667 0 0 0 0 1.334Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoDotsHorizontal16;
