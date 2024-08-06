import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSun24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
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
          d="M11.998 4.742V3.473m-5.132 13.66-.897.897m6.03 2.497v-1.27m6.029-13.286-.898.897M19.256 12h1.27m-3.396 5.132.898.898M3.47 12h1.27m1.228-6.03.897.898m8.226 2.038a4.375 4.375 0 1 1-6.187 6.188 4.375 4.375 0 0 1 6.187-6.188Z"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" transform="translate(2 2)" d="M0 0h20v20H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoSun24;
