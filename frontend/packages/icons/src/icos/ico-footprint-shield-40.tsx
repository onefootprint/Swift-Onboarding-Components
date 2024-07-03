import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFootprintShield40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M19.511 3.08a1.13 1.13 0 0 1 .977 0L36.37 10.7c.427.205.681.642.62 1.112C36.44 16.114 33.093 36.97 20 36.97c-13.092 0-16.44-20.856-16.991-25.158-.06-.47.194-.907.621-1.112l15.881-7.62Zm6.518 19.093h-2.753a3.44 3.44 0 0 0-3.442 3.438v2.75h-4.817v-16.5h11.012v3.12a2.752 2.752 0 0 0-4.13 2.38 2.751 2.751 0 0 0 4.13 2.379v2.433Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFootprintShield40;
