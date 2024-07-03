import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCake16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M6.725 1.65a.7.7 0 1 0-1.4 0v1.925h-2.8a.7.7 0 0 0-.7.7v7.748A2.445 2.445 0 0 0 .95 13.9v.438a.7.7 0 0 0 .7.7h12.688a.7.7 0 0 0 .7-.7V13.9c0-.753-.34-1.427-.876-1.877V4.275a.7.7 0 0 0-.7-.7h-2.8V1.65a.7.7 0 1 0-1.4 0v1.925H6.725V1.65Zm6.037 7.143v2.663a2.474 2.474 0 0 0-.175-.006H3.4c-.059 0-.117.002-.175.006V9.08c.29.07.656.144 1.078.196 1.054.132 2.49.137 3.938-.408 1.164-.44 2.352-.445 3.27-.33a8.281 8.281 0 0 1 1.252.255Zm0-1.448v-2.37H3.225v2.657l.152.043c.264.07.643.155 1.1.212.917.115 2.106.11 3.27-.33 1.447-.545 2.884-.54 3.938-.408a9.79 9.79 0 0 1 1.077.196ZM2.383 13.637h11.221a1.05 1.05 0 0 0-1.016-.787H3.4c-.49 0-.9.335-1.017.787Z"
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
export default IcoCake16;
