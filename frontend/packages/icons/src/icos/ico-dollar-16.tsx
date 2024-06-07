import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoDollar16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.86 7.994a6.134 6.134 0 1 1 12.269 0 6.134 6.134 0 0 1-12.269 0ZM7.994.46a7.534 7.534 0 1 0 0 15.069 7.534 7.534 0 0 0 0-15.069Zm.7 3.528v.243h1.421a.7.7 0 1 1 0 1.4h-2.71a.832.832 0 1 0 0 1.663h1.179a2.232 2.232 0 0 1 .11 4.462V12a.7.7 0 1 1-1.4 0v-.243h-1.42a.7.7 0 1 1 0-1.4h2.71a.832.832 0 0 0 0-1.664H7.405a2.232 2.232 0 0 1-.11-4.46v-.246a.7.7 0 1 1 1.4 0Z"
          fill={theme.color[color]}
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
export default IcoDollar16;
