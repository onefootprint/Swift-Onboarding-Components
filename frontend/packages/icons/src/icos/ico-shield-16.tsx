import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoShield16 = ({ color = 'primary', className, testID }: IconProps) => {
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
        d="M8 1.75 1.766 4.545S1.121 14.218 8 14.218s6.234-9.673 6.234-9.673L8 1.75Z"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m6.065 8.629 1.075 1.29 2.795-3.87"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoShield16;
