import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLink16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.499 2.243a4.416 4.416 0 1 1 6.245 6.246l-1.095 1.095a.7.7 0 0 1-.99-.99l1.095-1.095a3.016 3.016 0 0 0-4.265-4.266L7.394 4.328a.7.7 0 1 1-.99-.99l1.095-1.095Zm-3.17 4.16a.7.7 0 0 1 0 .99L3.232 8.49A3.016 3.016 0 1 0 7.5 12.754l1.095-1.095a.7.7 0 1 1 .99.99l-1.095 1.095a4.416 4.416 0 0 1-6.246-6.245l1.095-1.095a.7.7 0 0 1 .99 0Zm6.13.115a.7.7 0 1 0-.99-.99L5.528 9.469a.7.7 0 0 0 .99.99l3.941-3.941Z"
          fill={theme.color[color]}
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
export default IcoLink16;
