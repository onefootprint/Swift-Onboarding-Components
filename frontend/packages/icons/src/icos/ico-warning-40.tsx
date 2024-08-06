import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWarning40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g clipPath="url(#prefix__a)">
        <path
          d="M19.995 16.693v3.327M20 25h.017M18.559 5.82 4.811 29.16c-.653 1.108.148 2.507 1.436 2.507h27.496c1.289 0 2.09-1.399 1.436-2.508L21.431 5.82a1.667 1.667 0 0 0-2.872 0ZM20.417 25a.417.417 0 1 1-.833 0 .417.417 0 0 1 .833 0Z"
          stroke={theme.color[color]}
          strokeWidth={3.333}
          strokeLinecap="round"
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
export default IcoWarning40;
