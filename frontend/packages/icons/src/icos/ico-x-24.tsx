import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoX24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M16.503 4.917h2.401l-5.246 6 6.172 8.166h-4.833l-3.785-4.952-4.332 4.952H4.477l5.612-6.418-5.921-7.748h4.956l3.421 4.526 3.958-4.526Zm-.843 12.728h1.33L8.4 6.28H6.974l8.687 11.365Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoX24;
