import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoFileText16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.988 1.85c-.656 0-1.188.532-1.188 1.188v9.913c0 .656.532 1.188 1.188 1.188h8.025c.656 0 1.188-.531 1.188-1.188V7.043h-2.604a2.588 2.588 0 0 1-2.588-2.589V1.85h-4.02Zm5.42.99 2.803 2.803h-1.614a1.188 1.188 0 0 1-1.188-1.189V2.84ZM1.4 3.038A2.588 2.588 0 0 1 3.988.45h4.72a.7.7 0 0 1 .496.205l5.192 5.193a.7.7 0 0 1 .205.495v6.608a2.588 2.588 0 0 1-2.588 2.588H3.988A2.588 2.588 0 0 1 1.4 12.951V3.038Zm2.832 8.497a.7.7 0 0 1 .7-.7h6.137a.7.7 0 1 1 0 1.4H4.932a.7.7 0 0 1-.7-.7Zm.7-3.532a.7.7 0 1 0 0 1.4h2.36a.7.7 0 1 0 0-1.4h-2.36Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFileText16;
