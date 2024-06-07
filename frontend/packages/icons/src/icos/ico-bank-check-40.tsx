import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoBankCheck40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <rect x={7} y={15.4} width={20} height={2.4} rx={1.2} fill={theme.color[color]} />
      <rect x={7} y={11} width={14} height={2.4} rx={1.2} fill={theme.color[color]} />
      <rect x={7} y={27.5} width={3} height={2} rx={1} fill={theme.color[color]} />
      <rect x={11} y={27.5} width={3} height={2} rx={1} fill={theme.color[color]} />
      <rect x={15} y={27.5} width={3} height={2} rx={1} fill={theme.color[color]} />
      <rect x={19} y={27.5} width={3} height={2} rx={1} fill={theme.color[color]} />
      <rect
        width={36}
        height={28}
        rx={5}
        transform="matrix(1 0 0 -1 2 34)"
        stroke={theme.color[color]}
        strokeWidth={3}
      />
    </svg>
  );
};
export default IcoBankCheck40;
