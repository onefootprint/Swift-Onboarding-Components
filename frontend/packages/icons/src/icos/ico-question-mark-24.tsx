import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoQuestionMark24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.234 9.25a2.248 2.248 0 0 1 4.098.147 2.25 2.25 0 0 1-.503 2.456c-.5.493-1.108 1.025-1.402 1.65M12.25 16.5v.01m0 2.99a7.25 7.25 0 1 1 0-14.498 7.25 7.25 0 0 1 0 14.498Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoQuestionMark24;
