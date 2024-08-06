import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoUser24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M15.124 7.417a3.125 3.125 0 1 1-6.25 0 3.125 3.125 0 0 1 6.25 0ZM11.999 13.042c-3.163 0-5.472 2.103-6.107 4.93-.108.479.28.903.772.903h10.67c.49 0 .88-.424.772-.904-.636-2.826-2.944-4.93-6.107-4.93Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoUser24;
