import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoHome16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 16 16"
    >
      <g clipPath="url(#prefix__a)">
        <g clipPath="url(#prefix__b)">
          <path
            d="M2.5 5.81c0-.185 0-.278.023-.364a.667.667 0 0 1 .1-.212c.053-.072.124-.131.268-.249l4.434-3.627c.24-.197.36-.295.494-.333a.667.667 0 0 1 .362 0c.133.038.254.136.494.333l4.434 3.627c.143.118.215.177.267.25a.67.67 0 0 1 .1.211c.024.086.024.179.024.365v6.261c0 .373 0 .56-.073.703a.667.667 0 0 1-.291.291c-.143.073-.33.073-.703.073H3.567c-.374 0-.56 0-.703-.073a.667.667 0 0 1-.291-.291c-.073-.143-.073-.33-.073-.703V5.811Z"
            stroke={theme.color[color]}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </g>
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
        <clipPath id="prefix__b">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoHome16;
