import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoMoon16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.962 5.327c0-.81.119-1.63.423-2.327C4.364 3.88 3 5.944 3 8.288A5.712 5.712 0 0 0 8.712 14c2.344 0 4.408-1.364 5.288-3.385-.698.304-1.517.424-2.327.424a5.712 5.712 0 0 1-5.711-5.712Z"
        stroke={theme.color[color]}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoMoon16;
