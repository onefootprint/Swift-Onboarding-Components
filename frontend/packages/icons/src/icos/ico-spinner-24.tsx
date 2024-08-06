import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSpinner24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M19.708 12A7.708 7.708 0 0 0 12 4.292"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="square"
      />
    </svg>
  );
};
export default IcoSpinner24;
