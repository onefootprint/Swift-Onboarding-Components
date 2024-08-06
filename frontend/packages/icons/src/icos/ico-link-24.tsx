import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLink24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m10.333 6.583.627-.618a5.003 5.003 0 0 1 7.075 7.075l-.618.627M6.583 10.333l-.618.627a5.003 5.003 0 0 0 7.075 7.075l.627-.618m-3.334-3.75 3.334-3.334"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoLink24;
