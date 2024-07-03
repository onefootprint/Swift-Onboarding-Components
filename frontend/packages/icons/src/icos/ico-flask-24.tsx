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
        d="M9.083 4.41h5.834m-7.948 9.333H17.03M10.25 4.41v3.408c0 .441-.125.873-.36 1.246l-4.554 7.213c-.905 1.432.124 3.3 1.818 3.3h9.692c1.694 0 2.723-1.868 1.818-3.3L14.11 9.064a2.337 2.337 0 0 1-.36-1.246V4.41"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
      />
    </svg>
  );
};
export default IcoFlask24;
