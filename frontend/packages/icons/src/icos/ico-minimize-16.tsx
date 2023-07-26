import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoMinimize16 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6.542 13.208v-3.75m0 0h-3.75m3.75 0-4.584 4.584m7.5-11.25v3.75m0 0h3.75m-3.75 0 4.584-4.584"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoMinimize16;
