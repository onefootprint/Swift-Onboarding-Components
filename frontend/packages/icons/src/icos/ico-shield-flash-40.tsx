import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoShieldFlash40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
      viewBox="0 0 40 40"
    >
      <g clipPath="url(#prefix__a)">
        <rect width={40} height={40} rx={2.5} fill="#fff" />
        <path
          d="M33.333 10.773v9.08c0 8.218-6.554 11.754-13.164 15.32l-.17.09-.168-.09c-6.61-3.566-13.165-7.102-13.165-15.32v-9.08c0-.712.452-1.345 1.125-1.576l11.667-4.01c.351-.121.733-.121 1.084 0l11.666 4.01a1.667 1.667 0 0 1 1.125 1.576Z"
          stroke={theme.color[color]}
          strokeWidth={3.33}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m20.775 12.5-3.662 6.038c0 .214.174.388.388.388h5.927c.31 0 .494.344.322.602l-5 7.972"
          stroke={theme.color[color]}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <rect width={40} height={40} rx={2.5} fill="#fff" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoShieldFlash40;
