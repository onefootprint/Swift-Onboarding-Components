import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoImages16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="m2.667 9.474 1.896-1.42a1.333 1.333 0 0 1 1.717.203c.995 1.071 2.148 2.046 3.72 2.046 1.448 0 2.408-.537 3.333-1.462M3.167 13.5h9.666a.667.667 0 0 0 .667-.667V3.167a.667.667 0 0 0-.667-.667H3.167a.667.667 0 0 0-.667.667v9.666c0 .368.298.667.667.667ZM11.5 5.833a1.333 1.333 0 1 1-2.667 0 1.333 1.333 0 0 1 2.667 0Z"
          stroke={theme.color[color]}
          strokeWidth={1.5}
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
export default IcoImages16;
