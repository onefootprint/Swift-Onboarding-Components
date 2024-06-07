import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoKey24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M15 4a5 5 0 0 0-4.958 5.648L4.22 15.47A.75.75 0 0 0 4 16v3.25c0 .414.336.75.75.75H8a.75.75 0 0 0 .53-.22l.75-.75a.75.75 0 0 0 .22-.53v-1h1a.75.75 0 0 0 .53-.22l1.25-1.25a.75.75 0 0 0 .22-.53v-1h1a.75.75 0 0 0 .53-.22l.322-.322A5 5 0 1 0 15 4Zm-3.5 5a3.5 3.5 0 1 1 2.755 3.42.75.75 0 0 0-.689.203l-.377.377H11.75a.75.75 0 0 0-.75.75v1.44l-.81.81H8.75a.75.75 0 0 0-.75.75v1.44l-.31.31H5.5v-2.19l5.877-5.876a.75.75 0 0 0 .202-.69A3.511 3.511 0 0 1 11.5 9ZM16 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoKey24;
