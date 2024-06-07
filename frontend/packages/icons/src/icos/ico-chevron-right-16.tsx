import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoChevronRight16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.7 4.24a.75.75 0 0 1 1.06-.04l3.5 3.25a.75.75 0 0 1 0 1.1l-3.5 3.25a.75.75 0 1 1-1.02-1.1L8.648 8 5.74 5.3a.75.75 0 0 1-.04-1.06Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronRight16;
