import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFootprintShield24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.741 3.043a.598.598 0 0 1 .518 0l8.408 4.04c.226.11.36.34.328.59-.291 2.279-2.063 13.343-8.995 13.343-6.932 0-8.704-11.064-8.995-13.344a.571.571 0 0 1 .328-.588l8.408-4.041Zm3.451 10.126h-1.457a1.823 1.823 0 0 0-1.822 1.823v1.458H9.361V7.7h5.83v1.654a1.458 1.458 0 1 0 0 2.524v1.29Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFootprintShield24;
