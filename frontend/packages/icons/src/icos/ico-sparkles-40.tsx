import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSparkles40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        clipRule="evenodd"
        stroke={theme.color[color]}
        strokeWidth={3.333}
        strokeLinejoin="round"
      >
        <path d="M36.667 25C28.565 25 25 28.565 25 36.667 25 28.565 21.435 25 13.334 25 21.434 25 25 21.435 25 13.333 25 21.435 28.565 25 36.667 25ZM18.334 10.833c-5.209 0-7.5 2.292-7.5 7.5 0-5.208-2.292-7.5-7.5-7.5 5.208 0 7.5-2.291 7.5-7.5 0 5.209 2.291 7.5 7.5 7.5Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h40v40H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoSparkles40;
