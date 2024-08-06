import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoHeart16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M14.167 6.625c0 3.953-5.653 6.875-6.167 6.875-.514 0-6.167-2.922-6.167-6.875 0-2.75 1.713-4.125 3.426-4.125S8 3.531 8 3.531 9.028 2.5 10.74 2.5c1.714 0 3.427 1.375 3.427 4.125Z"
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
export default IcoHeart16;
