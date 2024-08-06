import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoRepeat40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="m28.75 35 4.41-4.41a.834.834 0 0 0 0-1.18L28.75 25M11.25 5 6.84 9.41a.833.833 0 0 0 0 1.18L11.25 15m-2.917-5h23.334c.92 0 1.666.746 1.666 1.667v6.666M6.667 21.667v6.666c0 .92.746 1.667 1.666 1.667h23.334"
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
export default IcoRepeat40;
