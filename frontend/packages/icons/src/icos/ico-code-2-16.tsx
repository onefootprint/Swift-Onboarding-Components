import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCode216 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.223 5.7a.75.75 0 1 0-1.02-1.1L1.14 7.444a.75.75 0 0 0 0 1.1l3.062 2.843a.75.75 0 0 0 1.02-1.1l-2.47-2.293L5.222 5.7Zm6.562-1.1a.75.75 0 1 0-1.02 1.1l2.47 2.294-2.47 2.294a.75.75 0 1 0 1.02 1.1l3.063-2.845a.75.75 0 0 0 0-1.099L11.785 4.6Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCode216;
