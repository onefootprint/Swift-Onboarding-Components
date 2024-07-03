import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWww16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M14.5 8A6.5 6.5 0 0 0 8 1.5M14.5 8h-13m13 0c0 .622-.087 1.224-.251 1.793M8 1.5A6.5 6.5 0 0 0 1.5 8M8 1.5C6.886 1.5 5.086 3.966 5.086 8c0 .638.045 1.237.126 1.793M8 1.5c1.114 0 2.914 2.466 2.914 6.5 0 .638-.045 1.237-.126 1.793M1.5 8c0 .622.087 1.224.251 1.793m.197 2.466.449 2.241 1.12-1.345 1.12 1.345.45-2.241m1.344 0 .448 2.241L8 13.155 9.12 14.5l.449-2.241m1.345 0 .448 2.241 1.12-1.345 1.121 1.345.449-2.241"
          stroke={theme.color[color]}
          strokeWidth={1.4}
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
export default IcoWww16;
