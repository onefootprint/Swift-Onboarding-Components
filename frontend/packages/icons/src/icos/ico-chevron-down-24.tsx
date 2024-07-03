import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronDown24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.49 9.3a.75.75 0 0 1 1.06.04L12 13.056l3.45-3.716a.75.75 0 1 1 1.1 1.02l-4 4.308a.75.75 0 0 1-1.1 0l-4-4.308a.75.75 0 0 1 .04-1.06Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronDown24;
