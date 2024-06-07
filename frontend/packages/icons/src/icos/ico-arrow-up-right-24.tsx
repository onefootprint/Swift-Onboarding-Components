import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoArrowUpRight24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.75 4a.75.75 0 0 0 0 1.5h6.69l-9.22 9.22a.75.75 0 1 0 1.06 1.06l9.22-9.22v6.69a.75.75 0 0 0 1.5 0v-8.5a.75.75 0 0 0-.75-.75h-8.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowUpRight24;
