import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoScroll24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.75 8.75h3.5m-3.5 3h3.5m4.375-7c-.898 0-1.375 1.007-1.375 2.25v.25m1.375-2.5c.898 0 1.625 1.007 1.625 2.25v.25h-3m1.375-2.5H8.75a2 2 0 0 0-2 2v10m9.5-9.5V17c0 1.243-.977 2.25-1.875 2.25m-7.625-2.5h6V17c0 1.243.727 2.25 1.625 2.25m-7.625-2.5h-2v.5a2 2 0 0 0 2 2h7.625"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoScroll24;
