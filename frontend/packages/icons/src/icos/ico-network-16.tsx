import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoNetwork16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g clipPath="url(#prefix__a)" stroke={theme.color[color]} strokeWidth={1.5}>
        <path d="M10.5 4.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM6.833 10.833a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM14.166 10.833a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoNetwork16;
