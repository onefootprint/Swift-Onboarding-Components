import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoActivity16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M1.167 7.833H3.51c.291 0 .548-.188.636-.466L5.839 2.01a.167.167 0 0 1 .318 0l3.681 11.966a.167.167 0 0 0 .32-.002l1.7-5.666a.667.667 0 0 1 .638-.475h2.337"
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
export default IcoActivity16;
