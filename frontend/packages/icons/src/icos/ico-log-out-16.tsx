import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoLogOut16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M3.322.84A2.482 2.482 0 0 0 .84 3.322v9.357a2.482 2.482 0 0 0 2.482 2.483h7.575a.7.7 0 1 0 0-1.4H3.322a1.082 1.082 0 0 1-1.082-1.083V3.322c0-.597.485-1.082 1.082-1.082h7.575a.7.7 0 1 0 0-1.4H3.322Zm7.508 3.788a.7.7 0 0 1 .989-.036l3.119 2.896a.7.7 0 0 1 0 1.026l-3.12 2.896a.7.7 0 0 1-.952-1.026l1.813-1.683H6.887a.7.7 0 1 1 0-1.4h5.792l-1.813-1.683a.7.7 0 0 1-.036-.99Z"
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
export default IcoLogOut16;
