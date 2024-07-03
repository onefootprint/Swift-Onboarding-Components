import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoHeart40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        clipRule="evenodd"
        d="M19.99 10.139c-3-3.359-8-4.262-11.758-1.187-3.758 3.075-4.287 8.217-1.336 11.854L19.99 32.932l13.093-12.126c2.951-3.637 2.487-8.81-1.336-11.854C27.925 5.91 22.99 6.78 19.99 10.14Z"
        stroke={theme.color[color]}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoHeart40;
