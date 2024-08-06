import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLink16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="m6.5 3.682.645-.644a4.113 4.113 0 1 1 5.817 5.817l-.646.646m-8.63-3.004-.648.648a4.113 4.113 0 0 0 5.818 5.817l.643-.643M6.333 9.667l3.334-3.334"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinecap="round"
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
export default IcoLink16;
