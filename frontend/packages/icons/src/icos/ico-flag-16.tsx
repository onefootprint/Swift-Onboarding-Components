import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoFlag16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M2.5 14.38V9.1m0 0V2.5S4.92.52 8 2.5s5.5 0 5.5 0v6.6s-2.42 1.98-5.5 0-5.5 0-5.5 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoFlag16;
