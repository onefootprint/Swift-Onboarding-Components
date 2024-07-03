import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoNetwork16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M4.69 4.69h.008m-.008 6.62h.008m6.612-6.62h.009m-.009 6.62h.009M9.034 8a1.034 1.034 0 1 1-2.069 0 1.034 1.034 0 0 1 2.07 0Zm0-4.966a1.034 1.034 0 1 1-2.069 0 1.034 1.034 0 0 1 2.07 0ZM14 8a1.035 1.035 0 1 1-2.069 0A1.035 1.035 0 0 1 14 8ZM4.069 8A1.034 1.034 0 1 1 2 8 1.034 1.034 0 0 1 4.07 8Zm4.965 4.966a1.034 1.034 0 1 1-2.068 0 1.034 1.034 0 0 1 2.068 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoNetwork16;
