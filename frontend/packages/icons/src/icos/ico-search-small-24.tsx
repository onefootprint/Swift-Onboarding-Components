import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSearchSmall24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m18 18-3.103-3.103M6 11.172a5.172 5.172 0 1 1 10.345 0 5.172 5.172 0 0 1-10.345 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoSearchSmall24;
