import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoMaximize24 = ({ color = 'primary', className, testID }: IconProps) => {
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
      <path
        d="M4.75 14.75v4.5h4.5M5 19l5.25-5.25m9-4.5v-4.5h-4.5M19 5l-5.25 5.25"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoMaximize24;
