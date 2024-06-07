import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoChartUp24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M17.75 5.5a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h.5a.25.25 0 0 0 .25-.25V5.75a.25.25 0 0 0-.25-.25h-.5ZM16 5.75c0-.966.784-1.75 1.75-1.75h.5c.966 0 1.75.784 1.75 1.75v12.5A1.75 1.75 0 0 1 18.25 20h-.5A1.75 1.75 0 0 1 16 18.25V5.75ZM9.44 5.5l-5.22 5.22a.75.75 0 1 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69Zm-3.69 10a.25.25 0 0 0-.25.25v2.5c0 .138.112.25.25.25h.5a.25.25 0 0 0 .25-.25v-2.5a.25.25 0 0 0-.25-.25h-.5ZM4 15.75c0-.966.784-1.75 1.75-1.75h.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 6.25 20h-.5A1.75 1.75 0 0 1 4 18.25v-2.5Zm7.5-3a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v5.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-5.5Zm.25-1.75A1.75 1.75 0 0 0 10 12.75v5.5c0 .967.784 1.75 1.75 1.75h.5A1.75 1.75 0 0 0 14 18.25v-5.5A1.75 1.75 0 0 0 12.25 11h-.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChartUp24;
