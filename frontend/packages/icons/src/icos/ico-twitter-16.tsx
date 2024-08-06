import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoTwitter16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M15.5 3.42a6.24 6.24 0 0 1-1.767.477 3.047 3.047 0 0 0 1.353-1.676c-.595.347-1.253.6-1.954.735A3.1 3.1 0 0 0 10.886 2c-1.7 0-3.078 1.356-3.078 3.03 0 .237.028.467.08.69a8.786 8.786 0 0 1-6.344-3.166 2.992 2.992 0 0 0-.416 1.523c0 1.05.544 1.979 1.37 2.522a3.108 3.108 0 0 1-1.395-.38v.04c0 1.467 1.06 2.692 2.469 2.97a3.146 3.146 0 0 1-1.39.052 3.073 3.073 0 0 0 2.875 2.103 6.238 6.238 0 0 1-3.822 1.297c-.249 0-.494-.014-.735-.042A8.804 8.804 0 0 0 5.217 14c5.661 0 8.756-4.616 8.756-8.619 0-.13-.003-.261-.009-.391A6.205 6.205 0 0 0 15.5 3.423l.001-.002Z"
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
export default IcoTwitter16;
