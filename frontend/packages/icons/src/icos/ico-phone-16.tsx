import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoPhone16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M5.214 1.5H2.682c-.653 0-1.182.53-1.182 1.182C1.5 9.209 6.791 14.5 13.318 14.5c.653 0 1.182-.53 1.182-1.182v-2.532l-2.786-1.857-1.444 1.444a.806.806 0 0 1-.941.166A9.946 9.946 0 0 1 7.07 8.93a7.822 7.822 0 0 1-1.646-2.28c-.144-.304-.06-.656.178-.895l1.468-1.468L5.214 1.5Z"
          stroke={theme.color[color]}
          strokeWidth={1.3}
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
export default IcoPhone16;
