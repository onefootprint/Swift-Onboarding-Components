import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLeaf40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 40 40"
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="M20 20v-1.667C20 11.89 14.777 6.667 8.333 6.667H6.666v1.666C6.667 14.777 11.89 20 18.334 20H20Zm0 0v3.333m0 0c0-6.443 5.223-11.666 11.666-11.666h1.667v1.666C33.333 19.777 28.11 25 21.667 25H20m0-1.667V25m0 0v8.333"
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
export default IcoLeaf40;
