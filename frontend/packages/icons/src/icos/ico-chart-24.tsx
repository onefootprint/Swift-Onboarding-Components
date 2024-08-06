import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChart24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
      viewBox="0 0 24 24"
    >
      <path
        d="m15.333 19.917-.714-2.5m-5.952 2.5.714-2.5m-.714-4.584v.834m3.333-5v5m3.333-2.5v2.5m4.167-7.5v10c0 .46-.373.833-.833.833H5.333a.833.833 0 0 1-.833-.833v-10c0-.46.373-.834.833-.834h13.334c.46 0 .833.373.833.834Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoChart24;
