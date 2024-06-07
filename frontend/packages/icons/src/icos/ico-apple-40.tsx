import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoApple40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M33.747 27.478c-.75 1.666-1.111 2.41-2.076 3.88-1.35 2.055-3.256 4.62-5.609 4.636-2.095.02-2.636-1.367-5.48-1.342-2.843.014-3.436 1.37-5.533 1.348-2.356-.022-4.158-2.332-5.508-4.383-3.778-5.753-4.177-12.498-1.843-16.085 1.652-2.543 4.264-4.037 6.717-4.037 2.5 0 4.071 1.372 6.136 1.372 2.006 0 3.226-1.375 6.117-1.375 2.185 0 4.495 1.19 6.147 3.244-5.402 2.962-4.525 10.677.932 12.742ZM24.473 9.196c1.051-1.35 1.85-3.256 1.56-5.196-1.715.117-3.72 1.212-4.892 2.63-1.063 1.294-1.943 3.212-1.6 5.068 1.872.06 3.81-1.057 4.931-2.502Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoApple40;
