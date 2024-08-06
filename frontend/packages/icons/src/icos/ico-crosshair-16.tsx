import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCrosshair16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        <g clipPath="url(#prefix__b)">
          <path
            d="M7.833 1v4.333m6.834 2.5h-4.334m-2.5 2.5v4.334m-2.5-6.834H1m6.833 4.834a4.833 4.833 0 1 1 0-9.667 4.833 4.833 0 0 1 0 9.667Z"
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
export default IcoCrosshair16;
