import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoIdCard24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.625 10.542h2.083m-2.083 2.916h2.083m5.833.417h-2.083a.833.833 0 0 1-.833-.833v-2.084c0-.46.373-.833.833-.833h2.083c.46 0 .834.373.834.833v2.084c0 .46-.373.833-.834.833ZM5.125 18.042h13.75c.46 0 .833-.373.833-.834V6.792a.833.833 0 0 0-.833-.834H5.125a.833.833 0 0 0-.833.834v10.416c0 .46.373.834.833.834Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoIdCard24;
