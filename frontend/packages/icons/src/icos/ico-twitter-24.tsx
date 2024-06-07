import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoTwitter24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M21.84 5.894a8.063 8.063 0 0 1-2.32.636 4.046 4.046 0 0 0 1.775-2.235 8.1 8.1 0 0 1-2.566.981 4.04 4.04 0 0 0-6.883 3.683 11.467 11.467 0 0 1-8.325-4.22 4.03 4.03 0 0 0-.546 2.031c0 1.401.712 2.638 1.796 3.362a4.031 4.031 0 0 1-1.83-.506v.051a4.04 4.04 0 0 0 3.24 3.96 4.044 4.044 0 0 1-1.824.07 4.044 4.044 0 0 0 3.774 2.806 8.101 8.101 0 0 1-5.981 1.673A11.436 11.436 0 0 0 8.342 20c7.43 0 11.492-6.155 11.492-11.493 0-.175-.004-.349-.011-.522a8.22 8.22 0 0 0 2.016-2.091Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoTwitter24;
