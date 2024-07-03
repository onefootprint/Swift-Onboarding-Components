import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoMoon24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.942 8.178c0-.975.144-1.962.51-2.803-2.435 1.06-4.077 3.546-4.077 6.37 0 3.8 3.08 6.88 6.88 6.88 2.824 0 5.31-1.643 6.37-4.077-.84.366-1.828.51-2.803.51a6.88 6.88 0 0 1-6.88-6.88Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoMoon24;
