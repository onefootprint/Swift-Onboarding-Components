import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoShield40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="m15.833 19.583 2.5 2.5 5.834-5.833m9.166 3.604v-9.081c0-.712-.452-1.345-1.125-1.576l-11.666-4.01a1.667 1.667 0 0 0-1.084 0L7.791 9.196a1.667 1.667 0 0 0-1.125 1.576v9.08c0 8.288 6.667 11.814 13.334 15.41 6.666-3.596 13.333-7.122 13.333-15.41Z"
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
export default IcoShield40;
