import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoIdBack40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <rect
        width={30}
        height={30}
        rx={5}
        transform="matrix(1 0 0 -1 5 35)"
        stroke={theme.color[color]}
        strokeWidth={3}
      />
      <rect x={10} y={10.5} width={20} height={2.4} rx={1.2} fill={theme.color[color]} />
      <rect x={16} y={15.5} width={14} height={2.4} rx={1.2} fill={theme.color[color]} />
      <path
        d="M10 25.714c0-.947.995-1.714 2.222-1.714h15.556c1.227 0 2.222.767 2.222 1.714v2.572c0 .947-.995 1.714-2.222 1.714H12.222C10.995 30 10 29.233 10 28.286v-2.572Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoIdBack40;
