import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoSquareFrame24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M6.159 6.159A2.25 2.25 0 0 1 7.75 5.5h8.5a2.25 2.25 0 0 1 2.25 2.25v8.5a2.25 2.25 0 0 1-2.25 2.25h-8.5a2.25 2.25 0 0 1-2.25-2.25v-8.5c0-.597.237-1.169.659-1.591ZM7.75 4A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5Zm1 3A1.75 1.75 0 0 0 7 8.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.25.25 0 0 1 .25-.25h1.5a.75.75 0 0 0 0-1.5h-1.5Zm5 0a.75.75 0 0 0 0 1.5h1.5a.25.25 0 0 1 .25.25v1.5a.75.75 0 0 0 1.5 0v-1.5A1.75 1.75 0 0 0 15.25 7h-1.5ZM8.5 13.75a.75.75 0 0 0-1.5 0v1.5A1.75 1.75 0 0 0 8.75 17h1.5a.75.75 0 0 0 0-1.5h-1.5a.25.25 0 0 1-.25-.25v-1.5Zm8.5 0a.75.75 0 0 0-1.5 0v1.5a.25.25 0 0 1-.25.25h-1.5a.75.75 0 0 0 0 1.5h1.5A1.75 1.75 0 0 0 17 15.25v-1.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSquareFrame24;
