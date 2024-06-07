import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoInfo24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.5 12a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0ZM12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-1 5a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm1 3a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoInfo24;
