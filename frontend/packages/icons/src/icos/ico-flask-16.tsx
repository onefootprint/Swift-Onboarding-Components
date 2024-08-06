import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFlask16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="m8.834 2.5.666.667m0 0L12.834 6.5M9.5 3.167l-7 7A2.357 2.357 0 1 0 5.834 13.5l7-7m0 0 .666.667M4.493 8.5h5.997M13.334 4v-.007m-.5-2.326a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM13.5 4a.167.167 0 1 1-.333 0 .167.167 0 0 1 .333 0Z"
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
export default IcoFlask16;
