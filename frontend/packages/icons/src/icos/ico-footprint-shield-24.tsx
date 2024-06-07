import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoFootprintShield24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 7.034 12 3l9 4.034S20.24 21 12 21 3 7.034 3 7.034Zm11.917 6.06h-1.458a1.823 1.823 0 0 0-1.824 1.823v1.458H9.083v-8.75h5.834V9.28a1.458 1.458 0 1 0 0 2.523v1.29Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFootprintShield24;
