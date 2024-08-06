import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPasskey40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M19.998 21.667c-6.326 0-10.944 4.205-12.214 9.86-.216.957.562 1.806 1.544 1.806h14.003m2.5-22.5a5.833 5.833 0 1 1-11.667 0 5.833 5.833 0 0 1 11.667 0Z"
        stroke={theme.color[color]}
        strokeWidth={3.333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M30 18.333a5 5 0 0 0-2.083 9.547v5.886c0 .253.115.493.313.65l1.25 1a.833.833 0 0 0 1.04 0l1.25-1a.833.833 0 0 0 .313-.65v-1.388l-1.25-1.128 1.25-1.25v-2.12A5 5 0 0 0 30 18.333Zm-1.667 5a1.667 1.667 0 1 1 3.334 0 1.667 1.667 0 0 1-3.334 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPasskey40;
