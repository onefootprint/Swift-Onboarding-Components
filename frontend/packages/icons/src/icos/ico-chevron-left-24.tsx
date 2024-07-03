import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronLeft24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M14.707 7.49a.75.75 0 0 0-1.06-.04l-4.307 4a.75.75 0 0 0 0 1.1l4.307 4a.75.75 0 1 0 1.021-1.1L10.952 12l3.716-3.45a.75.75 0 0 0 .04-1.06Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronLeft24;
