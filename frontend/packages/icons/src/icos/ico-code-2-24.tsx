import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoCode224 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.76 9.3a.75.75 0 0 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 1 0 1.02-1.1L5.852 12 8.76 9.3Zm7.5-1.1a.75.75 0 1 0-1.02 1.1l2.908 2.7-2.908 2.7a.75.75 0 1 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCode224;
