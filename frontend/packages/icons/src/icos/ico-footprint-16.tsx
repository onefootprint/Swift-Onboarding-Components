import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFootprint16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        <path d="M10 9.5h2V7.73a2 2 0 1 1 0-3.46V2H4v12h3.5v-2A2.5 2.5 0 0 1 10 9.5Z" fill={theme.color[color]} />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoFootprint16;
