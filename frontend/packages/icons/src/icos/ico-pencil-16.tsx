import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPencil16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 16 16"
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="m8.834 4.167 2.028-2.029c.26-.26.683-.26.943 0l2.057 2.057c.26.26.26.683 0 .943l-2.028 2.029m-3-3L2.029 10.97a.667.667 0 0 0-.196.472v2.724h2.724c.177 0 .347-.07.472-.196l6.805-6.804m-3-3 3 3"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
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
export default IcoPencil16;
