import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoMinimize24 = ({ color = 'primary', className, testID }: IconProps) => {
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
        d="M10.25 18.25v-4.5m0 0h-4.5m4.5 0-5.5 5.5m9-13.5v4.5m0 0h4.5m-4.5 0 5.5-5.5"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoMinimize24;
