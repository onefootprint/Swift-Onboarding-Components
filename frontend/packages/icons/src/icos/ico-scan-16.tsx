import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoScan16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.685 13.874h1.438a1.75 1.75 0 0 0 1.75-1.75v-1.437m0-5.375V3.875a1.75 1.75 0 0 0-1.75-1.75h-1.438m-5.374 11.75H3.873a1.75 1.75 0 0 1-1.75-1.75v-1.438m0-5.375V3.875a1.75 1.75 0 0 1 1.75-1.75h1.438"
        stroke={theme.color[color]}
        strokeWidth={1.375}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoScan16;
