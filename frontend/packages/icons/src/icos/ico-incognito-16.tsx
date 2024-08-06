import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoIncognito16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M2.5 8.68c3.194 3.396 7.806 3.396 11 0m-11-3.598C4.097 3.384 6.048 2.535 8 2.535s3.903.849 5.5 2.547M8 11.333V13.5M5.5 11l-1 1.655M10.333 11l1.167 1.655"
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
export default IcoIncognito16;
