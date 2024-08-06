import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCompass16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M9.029 14.456a.333.333 0 0 0 .637.008l3.637-11.347a.333.333 0 0 0-.42-.42L1.537 6.336a.333.333 0 0 0 .008.637L7.16 8.615c.11.032.194.118.226.227l1.644 5.614Z"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinecap="round"
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
export default IcoCompass16;
