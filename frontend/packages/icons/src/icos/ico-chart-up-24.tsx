import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChartUp24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M4.5 6.167V17c0 .46.373.833.833.833H19.5M7.833 14.5l2.744-2.744a.833.833 0 0 1 1.179 0l.488.488a.833.833 0 0 0 1.179 0l3.994-3.994M14.5 7.833h3.333v3.334"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoChartUp24;
