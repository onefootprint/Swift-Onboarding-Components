import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoLock24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.283 6.448C9.751 5.968 10.558 5.5 12 5.5c1.442 0 2.249.468 2.717.948.393.403.601.943.702 1.628.087.596.085 1.23.082 1.909V10H8.499v-.015c-.003-.679-.005-1.313.082-1.91.1-.684.309-1.224.702-1.627ZM7 10c-.003-.67-.006-1.428.098-2.142.126-.855.416-1.744 1.113-2.458C8.985 4.605 10.19 4 12 4s3.015.605 3.79 1.4c.697.714.987 1.603 1.113 2.458.104.714.101 1.472.098 2.142h.249c.966 0 1.75.784 1.75 1.75v5.5A2.75 2.75 0 0 1 16.25 20h-8.5A2.75 2.75 0 0 1 5 17.25v-5.5c0-.966.784-1.75 1.75-1.75h.249ZM6.5 11.75a.25.25 0 0 1 .25-.25h10.5a.25.25 0 0 1 .25.25v5.5c0 .69-.56 1.25-1.25 1.25h-8.5c-.69 0-1.25-.56-1.25-1.25v-5.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLock24;
