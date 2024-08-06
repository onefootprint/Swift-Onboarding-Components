import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEmail16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        <path
          d="M14.504 6.003a.75.75 0 0 0-.675-1.34l.675 1.34ZM2.17 4.663a.75.75 0 1 0-.674 1.34l.674-1.34ZM8.3 8.29l.337.67-.337-.67Zm-.6 0-.338.67.338-.67Zm5.716-4.456v8.334h1.5V3.833h-1.5Zm.084 8.25h-11v1.5h11v-1.5Zm-10.917.084V3.833h-1.5v8.334h1.5ZM2.5 3.917h11v-1.5h-11v1.5Zm11.329.747L7.962 7.62l.675 1.34 5.867-2.957-.675-1.34ZM8.037 7.62 2.17 4.664l-.674 1.34 5.866 2.955.675-1.34ZM2.583 3.833a.083.083 0 0 1-.083.084v-1.5c-.783 0-1.417.634-1.417 1.416h1.5Zm-.083 8.25c.046 0 .083.038.083.084h-1.5c0 .782.634 1.416 1.417 1.416v-1.5Zm10.916.084c0-.046.038-.084.084-.084v1.5c.782 0 1.416-.634 1.416-1.416h-1.5ZM7.962 7.62a.083.083 0 0 1 .075 0l-.675 1.34c.401.201.874.201 1.275 0l-.675-1.34Zm6.954-3.787c0-.782-.634-1.416-1.416-1.416v1.5a.083.083 0 0 1-.084-.084h1.5Z"
          fill={theme.color[color]}
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
export default IcoEmail16;
