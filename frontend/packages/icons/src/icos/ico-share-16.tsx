import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoShare16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M3.474 2.5a.974.974 0 0 0-.974.974v9.054c0 .538.436.974.974.974h9.054a.974.974 0 0 0 .974-.974v-2.156a.75.75 0 1 1 1.5 0v2.156a2.474 2.474 0 0 1-2.474 2.474H3.474A2.474 2.474 0 0 1 1 12.528V3.474A2.474 2.474 0 0 1 3.474 1H5.63a.75.75 0 0 1 0 1.5H3.474Zm6.148-.75a.75.75 0 0 1 .75-.75h3.88a.75.75 0 0 1 .75.75v3.88a.75.75 0 0 1-1.5 0V3.56L8.316 8.748a.75.75 0 0 1-1.06-1.06L12.44 2.5h-2.069a.75.75 0 0 1-.75-.75Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoShare16;
