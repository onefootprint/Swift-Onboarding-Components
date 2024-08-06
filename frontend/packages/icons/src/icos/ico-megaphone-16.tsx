import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoMegaphone16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M12.164 9.333a2 2 0 0 0 0-4m-3.78 6.834a2 2 0 0 1-3.887-.667v-1M4.5 4.167V10.5m7.665-7.763v9.193c0 .449-.435.77-.863.637l-9-2.78a.667.667 0 0 1-.47-.636V5.516c0-.293.19-.551.47-.637l9-2.78a.667.667 0 0 1 .863.638Z"
          stroke={theme.color[color]}
          strokeWidth={1.4}
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
export default IcoMegaphone16;
