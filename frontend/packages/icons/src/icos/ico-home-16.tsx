import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoHome16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g
        clipPath="url(#prefix__a)"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.4 14.338h9.188a1.75 1.75 0 0 0 1.75-1.75V6.025L7.994 1.65 1.65 6.025v6.563c0 .966.784 1.75 1.75 1.75Z" />
        <path d="M6.024 11.274c0-.966.784-1.75 1.75-1.75h.438c.966 0 1.75.784 1.75 1.75v3.063H6.024v-3.063Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoHome16;
