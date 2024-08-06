import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoInfo16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g clipPath="url(#prefix__a)" stroke={theme.color[color]}>
        <path
          d="M7.167 7.333H8v3.5M14.167 8A6.167 6.167 0 1 1 1.833 8a6.167 6.167 0 0 1 12.334 0Z"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M8 4.5a.417.417 0 1 0 0 .833.417.417 0 0 0 0-.833Z" fill={theme.color[color]} strokeWidth={0.7} />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoInfo16;
