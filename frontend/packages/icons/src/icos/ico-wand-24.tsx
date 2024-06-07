import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoWand24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M9.126 9.126a1.244 1.244 0 0 0 0 1.76l1.764 1.764 1.76-1.76-1.764-1.764a1.245 1.245 0 0 0-1.76 0ZM4 9.662h1.887H4Zm1.658-4.004 1.335 1.335-1.335-1.335ZM9.662 4v1.887V4Zm4.003 1.658-1.334 1.335 1.334-1.335Zm-6.672 6.673-1.335 1.334 1.335-1.334Z"
        fill={theme.color[color]}
      />
      <path
        d="M4 9.662h1.887m-.229-4.004 1.335 1.335M9.662 4v1.887m4.003-.229-1.334 1.335M6.993 12.33l-1.335 1.334m3.465-4.542a1.24 1.24 0 0 1 1.752 0l8.762 8.762a1.24 1.24 0 1 1-1.752 1.752l-8.762-8.762a1.24 1.24 0 0 1 0-1.752Zm.003.003a1.244 1.244 0 0 0 0 1.76l1.764 1.764 1.76-1.76-1.764-1.764a1.245 1.245 0 0 0-1.76 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
      />
    </svg>
  );
};
export default IcoWand24;
