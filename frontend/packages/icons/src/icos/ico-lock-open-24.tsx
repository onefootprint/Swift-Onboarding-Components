import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLockOpen24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12 13.667v2.5m-3.334-5.834v-2.5A3.333 3.333 0 0 1 15.229 7M7 19.5h10c.46 0 .833-.373.833-.833v-7.5a.833.833 0 0 0-.833-.834H7a.833.833 0 0 0-.833.834v7.5c0 .46.373.833.833.833Z"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoLockOpen24;
