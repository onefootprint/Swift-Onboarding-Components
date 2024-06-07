import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoEmail16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.727 2.21A2.327 2.327 0 0 0 1.4 4.537v6.917a2.328 2.328 0 0 0 2.327 2.328h8.545a2.327 2.327 0 0 0 2.327-2.328V4.537a2.327 2.327 0 0 0-2.327-2.327H3.727ZM2.8 4.534v6.92c0 .512.415.928.927.928h8.545a.927.927 0 0 0 .927-.928v-6.92l-4.736 4.19a.7.7 0 0 1-.927 0L2.8 4.534Zm9.33-.924H3.869L8 7.265l4.13-3.655Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoEmail16;
