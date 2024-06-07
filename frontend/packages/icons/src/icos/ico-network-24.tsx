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
    >
      <path
        d="M8 8h.01M8 16h.01M16 8h.01M16 16h.01m-2.76-4a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Zm0-6a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Zm6 6a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Zm-12 0a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Zm6 6a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoNetwork24;
