import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFlask24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m13.042 5.125.833.833m0 0 4.167 4.167m-4.167-4.167-8.75 8.75a2.946 2.946 0 0 0 4.167 4.167l8.75-8.75m0 0 .833.833m-11.26 1.667h7.497M18.666 7v-.008m-.624-2.909a.625.625 0 1 1-1.25 0 .625.625 0 0 1 1.25 0ZM18.875 7a.208.208 0 1 1-.417 0 .208.208 0 0 1 .417 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoFlask24;
