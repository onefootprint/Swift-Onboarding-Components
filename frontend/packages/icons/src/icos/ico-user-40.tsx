import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoUser40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M25.83 10.833a5.833 5.833 0 1 1-11.666 0 5.833 5.833 0 0 1 11.667 0ZM19.998 21.667c-6.326 0-10.944 4.205-12.214 9.86-.216.957.562 1.806 1.544 1.806h21.339c.982 0 1.76-.849 1.545-1.807-1.27-5.654-5.888-9.86-12.214-9.86Z"
        stroke={theme.color[color]}
        strokeWidth={3.333}
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoUser40;
