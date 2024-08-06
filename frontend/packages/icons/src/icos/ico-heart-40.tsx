import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoHeart40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
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
          d="M20 9.614c10.27-10.417 27.875 8.929 0 24.553C-7.875 18.543 9.73-.803 20 9.614Z"
          stroke={theme.color[color]}
          strokeWidth={3.333}
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h40v40H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoHeart40;
