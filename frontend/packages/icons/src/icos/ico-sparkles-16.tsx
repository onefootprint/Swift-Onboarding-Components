import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSparkles16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10.69 1.5c0 2.476-1.335 4.707-3.81 4.707 2.475 0 3.81 2.231 3.81 4.707 0-2.476 1.334-4.707 3.81-4.707-2.476 0-3.81-2.231-3.81-4.707ZM4.414 8.672c0 1.486-1.429 2.914-2.914 2.914 1.485 0 2.914 1.428 2.914 2.914 0-1.486 1.428-2.914 2.914-2.914-1.486 0-2.914-1.428-2.914-2.914Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoSparkles16;
