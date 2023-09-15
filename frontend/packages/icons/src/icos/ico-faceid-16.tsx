import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoFaceid16 = ({
  'aria-label': ariaLabel,
  color = 'primary',
  className,
  testID,
}: IconProps) => {
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
    >
      <path
        d="M5.63 1.75h-.432A3.448 3.448 0 0 0 1.75 5.198v.431M5.63 14.25h-.432a3.448 3.448 0 0 1-3.448-3.448v-.431M10.37 1.75h.432a3.448 3.448 0 0 1 3.448 3.448v.431M10.37 14.25h.432a3.448 3.448 0 0 0 3.448-3.448v-.431"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.707 6.276a.431.431 0 1 1-.862 0 .431.431 0 0 1 .862 0ZM10.155 6.276a.431.431 0 1 1-.862 0 .431.431 0 0 1 .862 0Z"
        stroke={theme.color[color]}
        strokeWidth={0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.198 8.647S5.414 10.802 8 10.802s2.802-2.155 2.802-2.155"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoFaceid16;
