import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPin16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path
        d="M5.09 4.19 4.193 1.5h7.62l-.896 2.69v2.017c2.69.896 2.69 3.81 2.69 3.81H2.4s0-2.914 2.69-3.81V4.19ZM8.003 10.241V14.5"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoPin16;
