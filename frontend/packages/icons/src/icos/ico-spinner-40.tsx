import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSpinner40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        <path
          d="M35.417 20c0-8.514-6.903-15.417-15.417-15.417"
          stroke={theme.color[color]}
          strokeWidth={3.75}
          strokeLinecap="square"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h40v40H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoSpinner40;
