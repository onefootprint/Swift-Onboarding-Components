import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLeaf16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M8 8v-.833A4.667 4.667 0 0 0 3.333 2.5H2.5v.833A4.667 4.667 0 0 0 7.167 8H8Zm0 0v5.5m4.667-9h.833v1a4.667 4.667 0 0 1-4.667 4.667H8v-1A4.667 4.667 0 0 1 12.667 4.5Z"
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
export default IcoLeaf16;
