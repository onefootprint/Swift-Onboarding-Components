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
      viewBox="0 0 40 40"
    >
      <g clipPath="url(#prefix__a)">
        <rect x={5} y={5} width={30} height={30} rx={3.75} stroke={theme.color[color]} strokeWidth={3.333} />
        <rect x={11.111} y={10} width={17.778} height={2.5} rx={1.25} fill={theme.color[color]} />
        <rect x={16.444} y={14.444} width={12.444} height={2.5} rx={1.25} fill={theme.color[color]} />
        <path
          d="M11.111 26.19c0-.841.885-1.523 1.976-1.523h13.827c1.09 0 1.975.682 1.975 1.523v2.286c0 .842-.884 1.524-1.975 1.524H13.087c-1.091 0-1.976-.682-1.976-1.524V26.19Z"
          fill={theme.color[color]}
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <rect width={40} height={40} rx={6} fill="#fff" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoIdBack40;
