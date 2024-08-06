import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSelfie24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.875 18.875H5.958a.833.833 0 0 1-.833-.833v-2.917m10 3.75h2.917c.46 0 .833-.373.833-.833v-2.917m-13.75-6.25V5.958c0-.46.373-.833.833-.833h2.917m6.25 0h2.917c.46 0 .833.373.833.833v2.917"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.459 13.875v-3.75c0-.46.373-.833.833-.833h.488a.833.833 0 0 0 .59-.244l.344-.346a.833.833 0 0 1 .59-.244h1.393c.22 0 .433.088.589.244l.345.346a.833.833 0 0 0 .59.244h.488c.46 0 .833.373.833.833v3.75c0 .46-.373.833-.833.833H9.292a.833.833 0 0 1-.833-.833Z"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 11.875v-.012m.625.012a.625.625 0 1 1-1.25 0 .625.625 0 0 1 1.25 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoSelfie24;
