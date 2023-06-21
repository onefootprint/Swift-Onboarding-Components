import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoSelfie24 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <circle cx={10} cy={9.625} fill={theme.color[color]} r={1} />
      <circle cx={14} cy={9.625} fill={theme.color[color]} r={1} />
      <path
        d="M9 13.875s.75 1.5 3 1.5 3-1.5 3-1.5"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <rect
        x={5.5}
        y={4}
        width={13}
        height={16}
        rx={3}
        stroke={theme.color[color]}
        strokeWidth={1.5}
      />
    </svg>
  );
};
export default IcoSelfie24;
