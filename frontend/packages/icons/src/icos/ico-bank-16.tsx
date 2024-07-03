import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBank16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.53 2.039a.7.7 0 0 1 .935 0l5.437 4.875a.7.7 0 0 1-.467 1.221h-.05v4.6h.05a.7.7 0 1 1 0 1.4H2.56a.7.7 0 0 1 0-1.4h.05v-4.6h-.05a.7.7 0 0 1-.467-1.221L7.53 2.039ZM4.01 12.735h1.6v-4.6h-1.6v4.6Zm3 0h1.975v-4.6H7.01v4.6Zm3.375 0h1.6v-4.6h-1.6v4.6Zm1.22-6L7.998 3.5 4.39 6.735h7.217Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoBank16;
