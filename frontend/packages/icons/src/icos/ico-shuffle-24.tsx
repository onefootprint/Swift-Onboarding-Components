import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoShuffle24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M18.75 14.25 21 16.5l-2.25 2.25m0-13.5L21 7.5l-2.25 2.25M3 16.5h3.993a3.75 3.75 0 0 0 3.12-1.67L12 12M3 7.5h3.993a3.75 3.75 0 0 1 3.12 1.67l3.774 5.66a3.75 3.75 0 0 0 3.12 1.67H19.5m0-9h-2.493a3.75 3.75 0 0 0-3.12 1.67l-.387.58"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoShuffle24;
