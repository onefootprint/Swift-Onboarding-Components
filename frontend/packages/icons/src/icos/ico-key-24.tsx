import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoKey24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M14.917 13.875a4.792 4.792 0 1 0-4.65-3.627L5.37 15.146a.833.833 0 0 0-.244.59v2.306c0 .46.373.833.833.833h2.307a.833.833 0 0 0 .589-.244l.854-.854v-2.235h2.235l1.81-1.81c.372.094.762.143 1.164.143Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.375 9.083a1.458 1.458 0 1 1-2.917 0 1.458 1.458 0 0 1 2.917 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="square"
      />
    </svg>
  );
};
export default IcoKey24;
