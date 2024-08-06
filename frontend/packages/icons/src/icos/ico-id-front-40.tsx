import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoIdFront40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 40 40"
    >
      <g clipPath="url(#prefix__a)">
        <circle cx={11.667} cy={11.667} fill={theme.color[color]} r={1.667} />
        <circle cx={16.667} cy={11.667} fill={theme.color[color]} r={1.667} />
        <path
          d="M10 15.833s1.042 1.94 4.167 1.94 4.166-1.94 4.166-1.94"
          stroke={theme.color[color]}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <rect x={24.286} y={24.286} width={5.714} height={2.5} rx={1.25} fill={theme.color[color]} />
        <rect x={20.477} y={28.095} width={9.524} height={2.5} rx={1.25} fill={theme.color[color]} />
        <rect x={5} y={5} width={30} height={30} rx={3.333} stroke={theme.color[color]} strokeWidth={3.333} />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <rect width={40} height={40} rx={6} fill="#fff" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoIdFront40;
