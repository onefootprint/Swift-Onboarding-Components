import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFaceid40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M16.273 15.31a1.172 1.172 0 1 1-2.344 0 1.172 1.172 0 0 1 2.344 0ZM25.653 15.31a1.172 1.172 0 1 1-2.345 0 1.172 1.172 0 0 1 2.345 0Z"
        stroke={theme.color[color]}
        strokeWidth={2.369}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.552 3h-1.173A9.38 9.38 0 0 0 3 12.38v1.172M13.552 37h-1.173A9.38 9.38 0 0 1 3 27.62v-1.172M26.448 3h1.173C32.8 3 37 7.2 37 12.38v1.172M26.448 37h1.173C32.8 37 37 32.8 37 27.62v-1.172m-24.62-4.69s.585 5.863 7.62 5.863c7.034 0 7.62-5.863 7.62-5.863"
        stroke={theme.color[color]}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoFaceid40;
