import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoUpload24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 24 24"
    >
      <path
        d="M12 5.125V14.5m0-9.375 3.75 3.75M12 5.125l-3.75 3.75m10.625 3.75v5.417c0 .46-.373.833-.833.833H5.958a.833.833 0 0 1-.833-.833v-5.417"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoUpload24;
