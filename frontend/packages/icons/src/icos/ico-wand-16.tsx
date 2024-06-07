import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoWand16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        <path
          d="M5.665 5.665a1.01 1.01 0 0 0 0 1.43l1.433 1.433 1.43-1.43-1.433-1.433a1.01 1.01 0 0 0-1.43 0ZM1.5 6.1h1.533H1.5Zm1.347-3.253 1.085 1.085-1.085-1.085ZM6.1 1.5v1.533V1.5Zm3.253 1.347L8.269 3.932l1.084-1.085ZM3.932 8.27 2.847 9.353l1.085-1.084Z"
          fill={theme.color[color]}
        />
        <path
          d="M1.5 6.1h1.533m-.186-3.253 1.085 1.085M6.1 1.5v1.533m3.253-.186L8.269 3.932M3.932 8.269 2.847 9.353m2.815-3.69a1.007 1.007 0 0 1 1.424 0l7.119 7.118a1.007 1.007 0 1 1-1.424 1.424L5.662 7.086a1.007 1.007 0 0 1 0-1.424Zm.003.002a1.01 1.01 0 0 0 0 1.43l1.433 1.433 1.43-1.43-1.433-1.433a1.01 1.01 0 0 0-1.43 0Z"
          stroke={theme.color[color]}
          strokeWidth={1.2}
          strokeMiterlimit={10}
          strokeLinecap="round"
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
export default IcoWand16;
