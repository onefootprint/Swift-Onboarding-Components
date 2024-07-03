import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoUserCircle40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 7C12.82 7 7 12.82 7 20c0 3.133 1.108 6.007 2.953 8.251A13.963 13.963 0 0 1 20 24.001c3.943 0 7.505 1.63 10.048 4.25a12.947 12.947 0 0 0 2.953-8.25c0-7.18-5.82-13.001-13-13.001Zm7.89 23.335A10.964 10.964 0 0 0 20 27a10.964 10.964 0 0 0-7.889 3.334A12.944 12.944 0 0 0 20.002 33c2.966 0 5.7-.994 7.889-2.666ZM4 20C4 11.164 11.164 4 20 4c8.837 0 16.001 7.164 16.001 16 0 8.837-7.164 16.001-16 16.001-8.837 0-16.001-7.164-16.001-16Zm16-7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-6 3a6 6 0 1 1 12 0 6 6 0 0 1-12 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoUserCircle40;
