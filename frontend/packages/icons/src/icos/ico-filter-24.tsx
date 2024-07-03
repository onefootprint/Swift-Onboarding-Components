import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFilter24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M19.25 4.75H4.75l4.562 5.702a2 2 0 0 1 .438 1.25v6.548a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-6.548a2 2 0 0 1 .438-1.25L19.25 4.75Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoFilter24;
