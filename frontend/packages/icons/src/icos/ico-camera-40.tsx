import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCamera40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        <path d="M6.667 11.667h4.941c.557 0 1.078-.279 1.387-.742l2.344-3.516c.309-.464.829-.742 1.386-.742h6.55c.557 0 1.077.278 1.387.742l2.343 3.516c.31.463.83.742 1.387.742h4.941c.92 0 1.667.746 1.667 1.666v18.334c0 .92-.746 1.666-1.667 1.666H6.667c-.92 0-1.667-.746-1.667-1.666V13.333c0-.92.746-1.666 1.667-1.666Z" />
        <path d="M25 21.667a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <rect width={40} height={40} rx={6} fill="#fff" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoCamera40;
