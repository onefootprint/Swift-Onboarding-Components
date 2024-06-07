import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoCheckCircle16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          fillRule="evenodd"
          clipRule="evenodd"
          d="M.4 8.1a7.6 7.6 0 1 1 15.199 0A7.6 7.6 0 0 1 .4 8.1ZM8 1.9a6.2 6.2 0 1 0 0 12.399A6.2 6.2 0 0 0 8 1.9Zm2.489 3.451a.7.7 0 0 1 .259.955L8.565 10.11c-.665 1.16-2.36 1.09-2.928-.12l-.413-.88a.7.7 0 1 1 1.268-.594l.413.88a.252.252 0 0 0 .446.018L9.533 5.61a.7.7 0 0 1 .956-.26Z"
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
export default IcoCheckCircle16;
