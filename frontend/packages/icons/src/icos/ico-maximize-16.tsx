import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoMaximize16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M1.958 10.292v3.75m0 0 4.584-4.584m-4.584 4.584h3.783M14.04 5.707v-3.75m0 0L9.457 6.54m4.583-4.583h-3.782"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoMaximize16;
