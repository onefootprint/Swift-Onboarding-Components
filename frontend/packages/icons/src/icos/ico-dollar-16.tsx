import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoDollar16 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <g clipPath="url(#prefix__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.4 7.994a5.594 5.594 0 1 1 11.188 0 5.594 5.594 0 0 1-11.188 0ZM7.994.9a7.094 7.094 0 1 0 0 14.187A7.094 7.094 0 0 0 7.994.9Zm.75 3.375V4.4h1.219a.75.75 0 0 1 0 1.5H7.447a.672.672 0 1 0 0 1.344H8.54a2.172 2.172 0 0 1 .203 4.334v.135a.75.75 0 0 1-1.5 0v-.125H6.025a.75.75 0 0 1 0-1.5h2.516a.672.672 0 0 0 0-1.344H7.447a2.172 2.172 0 0 1-.203-4.335v-.134a.75.75 0 0 1 1.5 0Z"
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
