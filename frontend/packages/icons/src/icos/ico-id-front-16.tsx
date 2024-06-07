import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoIdFront16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g clipPath="url(#prefix__a)">
        <circle cx={4.85} cy={5.15} fill={theme.color[color]} r={0.85} />
        <circle cx={7.817} cy={5.15} fill={theme.color[color]} r={0.85} />
        <path
          d="M4.533 7.475s.434.84 1.734.84S8 7.476 8 7.476"
          stroke={theme.color[color]}
          strokeWidth={1.3}
          strokeLinecap="round"
        />
        <rect x={9.857} y={9.857} width={2.476} height={1} rx={0.5} fill={theme.color[color]} />
        <rect x={8.206} y={11.508} width={4.127} height={1} rx={0.5} fill={theme.color[color]} />
        <rect x={1.5} y={1.5} width={13} height={13} rx={2} stroke={theme.color[color]} strokeWidth={1.5} />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoIdFront16;
