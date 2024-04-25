import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoShieldFlash24 = ({
  'aria-label': ariaLabel,
  color = 'primary',
  className,
  testID,
}: IconProps) => {
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
      <rect width={40} height={40} rx={2.5} fill="#fff" />
      <path
        d="M20.695 14.583 17.917 20h4.166l-2.778 5.417M7.917 11.25V20a12.084 12.084 0 0 0 24.166 0v-8.75L20 7.917 7.917 11.25Z"
        stroke={theme.color[color]}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoShieldFlash24;
