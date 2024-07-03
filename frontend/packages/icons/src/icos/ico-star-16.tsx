import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoStar16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m8 1.75 1.509 4.741h4.741L10.37 9.51l1.294 4.741L8 11.233 4.336 14.25 5.63 9.509 1.75 6.49h4.741L8 1.75Z"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoStar16;
