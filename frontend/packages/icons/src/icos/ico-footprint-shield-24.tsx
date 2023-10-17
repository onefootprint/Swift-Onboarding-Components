import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoFootprintShield24 = ({
  'aria-label': ariaLabel,
  color = 'primary',
  className,
  testID,
}: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={20}
      height={20}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="M10 1.25 1.273 5.172S2.009 18.75 10 18.75c7.99 0 8.727-13.578 8.727-13.578L10 1.25Z"
          fill={theme.color[color]}
          stroke={theme.color[color]}
          strokeWidth={1.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.459 11.094h1.458v-1.29a1.458 1.458 0 1 1 0-2.523V5.624H7.083v8.75h2.552v-1.458c0-1.007.817-1.823 1.824-1.823Z"
          fill="#fff"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h20v20H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoFootprintShield24;
