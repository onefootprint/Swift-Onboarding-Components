import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCar16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        <g clipPath="url(#prefix__b)">
          <path
            d="M1.5 7.167 3.804 3.48a.667.667 0 0 1 .566-.313h7.26c.23 0 .444.118.566.313L14.5 7.167m-13 0h-1m1 0v5c0 .368.298.666.667.666h1a.667.667 0 0 0 .666-.666v-.715h8.334v.715c0 .368.298.666.666.666h1a.667.667 0 0 0 .667-.666v-5m0 0h1M3.833 8.69h1.334m5.666 0h1.334"
            stroke={theme.color[color]}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
        <clipPath id="prefix__b">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoCar16;
