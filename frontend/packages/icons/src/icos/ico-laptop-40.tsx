import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLaptop40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g
        clipPath="url(#prefix__a)"
        stroke={theme.color[color]}
        strokeWidth={3.333}
        strokeLinecap="square"
        strokeLinejoin="round"
      >
        <path d="M6.667 8.333c0-.92.746-1.666 1.666-1.666h23.333c.921 0 1.667.746 1.667 1.666V25c0 .92-.746 1.667-1.666 1.667H8.332c-.92 0-1.667-.747-1.667-1.667V8.333Z" />
        <path d="M3.333 26.667h33.334v5c0 .92-.746 1.666-1.667 1.666H5c-.92 0-1.667-.746-1.667-1.666v-5Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h40v40H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoLaptop40;
