import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFootprint24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M14.5 13.667h2.222V11.7a2.222 2.222 0 1 1 0-3.845V5.333H7.833v13.334h3.89v-2.223a2.778 2.778 0 0 1 2.777-2.777Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFootprint24;
