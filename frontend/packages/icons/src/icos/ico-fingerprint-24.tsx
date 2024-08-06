import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFingerprint24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 24 24"
    >
      <path
        d="M7.196 18.088c.158-.381.303-.768.435-1.162m6.389 2.576a24.697 24.697 0 0 0 1.019-3.818m3.369.693c.313-1.688.477-3.429.477-5.208a6.877 6.877 0 0 0-9.887-6.186m-4.28 9.646c.27-1.11.412-2.268.412-3.46 0-1.496.478-2.88 1.29-4.01m5.588 4.01a21.473 21.473 0 0 1-1.707 8.408m-1.982-5.4c.164-.978.25-1.983.25-3.008a3.439 3.439 0 0 1 6.877 0c0 .53-.016 1.056-.049 1.578"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoFingerprint24;
