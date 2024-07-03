import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSmartphone16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M6.503 12.557h-.45m8.106-2.251s.45-.816.45-2.026-.45-2.027-.45-2.027M3.35 14.81h5.854c.995 0 1.802-.806 1.802-1.801V3.55c0-.995-.807-1.801-1.802-1.801H3.351c-.995 0-1.801.806-1.801 1.801v9.457c0 .995.806 1.801 1.801 1.801Z"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoSmartphone16;
