import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoMaximize16 = ({ color = 'primary', className, testID }: IconProps) => {
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
        d="M1.958 10.292v3.75h3.75m-3.541-.209 4.375-4.375m7.5-3.75v-3.75h-3.75m3.541.209L9.458 6.542"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoMaximize16;
