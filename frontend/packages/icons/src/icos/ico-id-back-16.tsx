import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoIdBack16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        <rect
          width={13}
          height={13}
          rx={2}
          transform="matrix(1 0 0 -1 1.5 14.5)"
          stroke={theme.color[color]}
          strokeWidth={1.4}
        />
        <rect x={3.667} y={3.883} width={8.667} height={1.04} rx={0.52} fill={theme.color[color]} />
        <rect x={6.267} y={6.05} width={6.067} height={1.04} rx={0.52} fill={theme.color[color]} />
        <path
          d="M3.667 10.476c0-.41.43-.743.963-.743h6.74c.532 0 .963.333.963.743v1.114c0 .41-.43.743-.963.743H4.63c-.532 0-.963-.332-.963-.743v-1.114Z"
          fill={theme.color[color]}
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoIdBack16;
