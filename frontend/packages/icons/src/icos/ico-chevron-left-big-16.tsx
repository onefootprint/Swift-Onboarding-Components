import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronLeftBig16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.629 2.922a.85.85 0 0 1-.044 1.2L6.409 8l4.176 3.877a.85.85 0 1 1-1.157 1.246l-4.846-4.5a.85.85 0 0 1 0-1.246l4.846-4.5a.85.85 0 0 1 1.201.045Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronLeftBig16;
