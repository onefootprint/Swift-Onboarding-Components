import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoIncognito24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.125 12.85c3.992 4.244 9.758 4.244 13.75 0M5.125 8.352C7.121 6.23 9.56 5.17 12 5.17c2.44 0 4.88 1.06 6.875 3.183M12 16.167v2.708M8.875 15.75l-1.25 2.068m7.292-2.068 1.458 2.068"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoIncognito24;
