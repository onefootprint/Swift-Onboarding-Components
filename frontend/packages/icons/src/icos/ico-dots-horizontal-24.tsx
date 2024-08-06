import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDotsHorizontal24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12 12.625a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25ZM16.583 12.625a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25ZM7.417 12.625a.625.625 0 1 0 0-1.25.625.625 0 0 0 0 1.25Z"
        stroke={theme.color[color]}
        strokeWidth={1.111}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoDotsHorizontal24;
