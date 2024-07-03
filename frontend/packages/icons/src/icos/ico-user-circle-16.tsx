import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoUserCircle16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g clipPath="url(#prefix__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.046 1.86a6.186 6.186 0 0 0-4.772 10.123 6.619 6.619 0 0 1 4.772-2.025c1.874 0 3.567.778 4.773 2.025A6.186 6.186 0 0 0 8.047 1.86Zm3.765 11.096a5.22 5.22 0 0 0-3.765-1.598 5.22 5.22 0 0 0-3.765 1.597 6.16 6.16 0 0 0 3.765 1.278 6.16 6.16 0 0 0 3.765-1.277ZM.46 8.046a7.586 7.586 0 1 1 15.173 0 7.586 7.586 0 0 1-15.173 0ZM8.046 4.71a1.437 1.437 0 1 0 0 2.874 1.437 1.437 0 0 0 0-2.874ZM5.21 6.147a2.837 2.837 0 1 1 5.675 0 2.837 2.837 0 0 1-5.675 0Z"
          fill={theme.color[color]}
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoUserCircle16;
