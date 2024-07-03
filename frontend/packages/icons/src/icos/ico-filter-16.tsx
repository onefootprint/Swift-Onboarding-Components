import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFilter16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M14.25 1.75H1.75l3.933 4.916c.244.305.377.685.377 1.077v5.645c0 .476.386.862.862.862h2.156a.862.862 0 0 0 .862-.862V7.743c0-.392.133-.772.378-1.077L14.25 1.75Z"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoFilter16;
