import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoArrowUp24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.254 18.348a.75.75 0 1 0 1.5 0V7.531l3.301 3.458a.75.75 0 1 0 1.085-1.035l-4.594-4.813a.75.75 0 0 0-1.085 0L6.867 9.955a.75.75 0 0 0 1.086 1.035l3.3-3.458v10.816Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowUp24;
