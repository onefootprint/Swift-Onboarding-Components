import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoFaceid24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.06 4.25h-.534A4.276 4.276 0 0 0 4.25 8.526v.534m4.81 10.69h-.534a4.276 4.276 0 0 1-4.276-4.276v-.534M14.94 4.25h.534a4.276 4.276 0 0 1 4.276 4.276v.534m-4.81 10.69h.534a4.276 4.276 0 0 0 4.276-4.276v-.534M8.526 12.802s.267 2.672 3.474 2.672c3.207 0 3.474-2.672 3.474-2.672"
        stroke={theme.color[color]}
        strokeWidth={1.736}
        strokeLinecap="round"
      />
      <rect
        x={9.344}
        y={9.398}
        width={0.992}
        height={0.992}
        rx={0.496}
        stroke={theme.color[color]}
        strokeWidth={0.992}
      />
      <rect
        x={13.56}
        y={9.398}
        width={0.992}
        height={0.992}
        rx={0.496}
        stroke={theme.color[color]}
        strokeWidth={0.992}
      />
    </svg>
  );
};
export default IcoFaceid24;
