import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoFootprintShield16 = ({
  'aria-label': ariaLabel,
  color = 'primary',
  className,
  testID,
}: IconProps) => {
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
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="M8 1 1.018 4.138S1.608 15 8 15c6.393 0 6.982-10.862 6.982-10.862L8 1Z"
          fill={theme.color[color]}
          stroke={theme.color[color]}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.167 8.875h1.166V7.843a1.167 1.167 0 1 1 0-2.019V4.5H5.667v7h2.041v-1.166c0-.806.653-1.459 1.459-1.459Z"
          fill="#fff"
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
export default IcoFootprintShield16;
