import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoIdFront24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <circle cx={8.509} cy={8.509} fill={theme.color[color]} r={0.776} />
      <circle cx={11.224} cy={8.509} fill={theme.color[color]} r={0.776} />
      <path
        d="M7.733 11.354s.534 1.034 2.134 1.034c1.6 0 2.133-1.034 2.133-1.034"
        stroke={theme.color[color]}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <rect x={14.286} y={14.286} width={3.048} height={1.016} rx={0.508} fill={theme.color[color]} />
      <rect x={12.254} y={16.317} width={5.079} height={1.016} rx={0.508} fill={theme.color[color]} />
      <rect x={4} y={4} width={16} height={16} rx={2} stroke={theme.color[color]} strokeWidth={1.5} />
    </svg>
  );
};
export default IcoIdFront24;
