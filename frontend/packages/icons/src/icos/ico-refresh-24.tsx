import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoRefresh24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.752 5.307a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h2.546c2.9 0 5.25 2.35 5.25 5.25v.25a.75.75 0 0 0 1.5 0V13a6.75 6.75 0 0 0-6.75-6.75h-2.546l1.048-.943Zm1.5 8.886a.75.75 0 1 0-1.004 1.114l1.048.943H10.75A5.25 5.25 0 0 1 5.5 11v-.25a.75.75 0 0 0-1.5 0V11a6.75 6.75 0 0 0 6.75 6.75h2.546l-1.048.942a.75.75 0 1 0 1.004 1.116l2.5-2.25a.75.75 0 0 0 0-1.116l-2.5-2.25Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoRefresh24;
