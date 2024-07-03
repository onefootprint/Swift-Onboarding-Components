import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSelfie16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <circle cx={6.435} cy={6.142} fill={theme.color[color]} r={0.782} />
      <circle cx={9.565} cy={6.142} fill={theme.color[color]} r={0.782} />
      <path
        d="M5.653 9.467S6.24 10.64 8 10.64s2.347-1.173 2.347-1.173"
        stroke={theme.color[color]}
        strokeWidth={1.095}
        strokeLinecap="round"
      />
      <rect
        x={2.915}
        y={1.741}
        width={10.171}
        height={12.518}
        rx={2.347}
        stroke={theme.color[color]}
        strokeWidth={1.4}
      />
    </svg>
  );
};
export default IcoSelfie16;
