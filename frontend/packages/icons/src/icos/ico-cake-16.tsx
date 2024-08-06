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
          d="M3.167 10.333V13.5c0 .368.298.667.667.667h8.333a.667.667 0 0 0 .667-.667v-3.167M8 4.833a1.5 1.5 0 0 1-1.062-2.56L8 1.212l1.06 1.06A1.5 1.5 0 0 1 8 4.834Zm0 0V6.5m0 0H3.5a.667.667 0 0 0-.667.667v2.27c0 .245.134.469.348.586l1.15.628c.208.113.46.108.663-.014l.997-.598a.667.667 0 0 1 .686 0l.98.588a.667.667 0 0 0 .686 0l.98-.588a.667.667 0 0 1 .687 0l.996.598a.667.667 0 0 0 .662.014l1.151-.628a.667.667 0 0 0 .348-.585V7.167A.667.667 0 0 0 12.5 6.5H8Z"
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
export default IcoCake16;
