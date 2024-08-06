import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPin16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="m5.144 10.495 2.95 2.949c.359.36.972.2 1.112-.289l1.28-4.483a.667.667 0 0 1 .31-.395l2.507-1.432a.667.667 0 0 0 .141-1.05l-3.599-3.6a.667.667 0 0 0-1.05.141L7.362 4.842a.667.667 0 0 1-.395.31L2.484 6.435a.667.667 0 0 0-.288 1.112l2.948 2.949Zm0 0 .005-.005m-.005.005-3.083 3.083"
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
export default IcoPin16;
