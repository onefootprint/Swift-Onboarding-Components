import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoClose40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M31.04 10.531a1.6 1.6 0 0 0-2.263-2.262l-9.123 9.123-9.123-9.123A1.6 1.6 0 0 0 8.27 10.53l9.123 9.123-9.123 9.123a1.6 1.6 0 1 0 2.262 2.263l9.123-9.123 9.123 9.123a1.6 1.6 0 0 0 2.263-2.263l-9.123-9.123 9.123-9.123Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoClose40;
