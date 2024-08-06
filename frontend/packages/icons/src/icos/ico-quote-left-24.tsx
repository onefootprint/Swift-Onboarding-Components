import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoQuoteLeft24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.04 7.833a.479.479 0 0 0-.097.01c-.052.01-1.988.344-3.326 1.95-1.132 1.358-1.217 2.703-1.283 3.672-.002.027 0 .053.003.08l-.002.033c0 1.397.914 3.073 3.142 3.074 1.705 0 3.017-1.267 3.017-3.074 0-1.192-.536-3.074-2.946-3.074-.473 0-.904.084-1.288.232.06-.087.123-.175.191-.263.674-.87 1.735-1.469 2.695-1.698a.478.478 0 0 0-.107-.942Zm7.172 0a.48.48 0 0 0-.096.01c-.052.01-1.989.344-3.326 1.95-1.132 1.358-1.217 2.703-1.283 3.672-.002.027 0 .053.002.08l-.001.033c0 1.397.914 3.073 3.142 3.074 1.705 0 3.017-1.267 3.017-3.074 0-1.192-.536-3.074-2.946-3.074-.473 0-.905.084-1.289.232.06-.087.124-.175.192-.263.674-.87 1.735-1.469 2.695-1.698a.478.478 0 0 0-.107-.942Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoQuoteLeft24;
