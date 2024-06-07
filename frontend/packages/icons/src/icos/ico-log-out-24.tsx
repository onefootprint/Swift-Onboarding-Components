import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoLogOut24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.112 4.5A2.612 2.612 0 0 0 4.5 7.112v9.776A2.612 2.612 0 0 0 7.112 19.5h7.914a.75.75 0 0 0 0-1.5H7.112A1.112 1.112 0 0 1 6 16.888V7.112C6 6.498 6.498 6 7.112 6h7.914a.75.75 0 0 0 0-1.5H7.112Zm7.83 3.964a.75.75 0 0 1 1.06-.04l3.258 3.026a.75.75 0 0 1 0 1.1l-3.258 3.025a.75.75 0 0 1-1.02-1.099l1.858-1.726h-6.004a.75.75 0 0 1 0-1.5h6.004l-1.859-1.726a.75.75 0 0 1-.04-1.06Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLogOut24;
