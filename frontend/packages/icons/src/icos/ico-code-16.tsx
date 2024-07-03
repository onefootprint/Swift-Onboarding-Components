import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCode16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.463.95A2.513 2.513 0 0 0 .95 3.463v9.52a2.513 2.513 0 0 0 2.513 2.513h9.52a2.513 2.513 0 0 0 2.513-2.513v-9.52A2.513 2.513 0 0 0 12.983.95h-9.52ZM2.35 3.463c0-.615.498-1.113 1.113-1.113h9.52c.615 0 1.113.498 1.113 1.113v9.52c0 .615-.498 1.113-1.113 1.113h-9.52a1.113 1.113 0 0 1-1.113-1.113v-9.52ZM5.745 6.57a.7.7 0 1 0-.937 1.041l1.689 1.52-1.689 1.52a.7.7 0 0 0 .937 1.04L8.01 9.65a.7.7 0 0 0 0-1.04L5.745 6.57Z"
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
export default IcoCode16;
