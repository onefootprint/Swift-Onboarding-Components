import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChartUp40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="m26.667 35.833-1.429-5m-11.905 5 1.429-5m-1.429-9.166v1.666m6.667-10v10m6.667-5v5m8.333-15v20c0 .92-.746 1.667-1.667 1.667H6.667C5.747 30 5 29.254 5 28.333v-20c0-.92.746-1.666 1.667-1.666h26.666c.92 0 1.667.746 1.667 1.666Z"
          stroke={theme.color[color]}
          strokeWidth={3.333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h40v40H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoChartUp40;
