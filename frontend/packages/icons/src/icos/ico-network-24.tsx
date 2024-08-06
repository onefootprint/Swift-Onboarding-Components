import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoNetwork24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M15.125 7.625a3.125 3.125 0 1 1-6.25 0 3.125 3.125 0 0 1 6.25 0ZM10.541 15.542a3.125 3.125 0 1 1-6.25 0 3.125 3.125 0 0 1 6.25 0ZM19.709 15.542a3.125 3.125 0 1 1-6.25 0 3.125 3.125 0 0 1 6.25 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
      />
    </svg>
  );
};
export default IcoNetwork24;
