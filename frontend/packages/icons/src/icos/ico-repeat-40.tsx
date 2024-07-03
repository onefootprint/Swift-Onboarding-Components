import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoRepeat40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m25 9.375 3.75 3.75-3.75 3.75m2.5-3.75H11.25A6.269 6.269 0 0 0 5 19.375v1.25m10 10-3.75-3.75 3.75-3.75m-2.5 3.75h16.25a6.269 6.269 0 0 0 6.25-6.25v-1.25"
        stroke={theme.color[color]}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoRepeat40;
