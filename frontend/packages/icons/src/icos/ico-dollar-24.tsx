import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoDollar24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.5 12a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0ZM12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm.75 3.75V8h1.5a.75.75 0 0 1 0 1.5h-2.875a.875.875 0 0 0 0 1.75h1.25a2.375 2.375 0 0 1 .125 4.747v.253a.75.75 0 0 1-1.5 0V16h-1.5a.75.75 0 0 1 0-1.5h2.875a.875.875 0 0 0 0-1.75h-1.25a2.375 2.375 0 0 1-.125-4.747V7.75a.75.75 0 0 1 1.5 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoDollar24;
