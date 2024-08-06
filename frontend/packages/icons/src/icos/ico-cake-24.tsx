import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCake24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.958 14.917v3.958c0 .46.373.833.833.833h10.417c.46 0 .834-.373.834-.833v-3.958M12 8.042a1.875 1.875 0 0 1-1.327-3.2l1.325-1.327 1.326 1.326A1.875 1.875 0 0 1 12 8.04Zm0 0v2.083m0 0H6.375a.833.833 0 0 0-.833.833v2.839c0 .305.166.585.434.731l1.438.785c.26.142.575.135.828-.017l1.246-.747a.834.834 0 0 1 .857 0l1.226.735a.833.833 0 0 0 .858 0l1.225-.735a.834.834 0 0 1 .858 0l1.245.747a.833.833 0 0 0 .828.017l1.439-.785a.833.833 0 0 0 .434-.731v-2.839a.833.833 0 0 0-.833-.833H12Z"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoCake24;
