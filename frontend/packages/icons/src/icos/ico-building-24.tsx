import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBuilding24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M6.167 18.667v-12.5c0-.46.373-.834.833-.834h10c.46 0 .833.373.833.834v12.5m-11.666 0h11.666m-11.666 0H4.5m13.333 0H19.5m-10-10h.833m3.334 0h.833M9.5 12h.833m3.334 0h.833m-5 3.333h.833m3.334 0h.833"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoBuilding24;
