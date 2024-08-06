import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDollar40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path
        d="M20 12.5v-1.667M20 27.5v1.667M23.61 15c-.721-.996-2.068-1.667-3.61-1.667h-.463c-2.046 0-3.704 1.327-3.704 2.963v.128c0 1.17.827 2.24 2.136 2.764l4.062 1.625c1.309.523 2.136 1.593 2.136 2.764 0 1.706-1.73 3.09-3.863 3.09H20c-1.542 0-2.889-.67-3.61-1.667M35 20c0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15 0-8.284 6.716-15 15-15 8.284 0 15 6.716 15 15Z"
        stroke={theme.color[color]}
        strokeWidth={3.333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoDollar40;
