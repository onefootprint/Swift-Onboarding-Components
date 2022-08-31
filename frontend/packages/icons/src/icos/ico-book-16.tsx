import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoBook16 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <g
        clipPath="url(#prefix__a)"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.375 2.51a.88.88 0 0 0-.88-.88H9.76C8.787 1.63 8 2.417 8 3.389V14.38l.728-.728a3.517 3.517 0 0 1 2.488-1.03h2.28a.88.88 0 0 0 .879-.88V2.51ZM1.625 2.51a.88.88 0 0 1 .88-.88H6.24C7.213 1.63 8 2.417 8 3.389V14.38l-.728-.728a3.517 3.517 0 0 0-2.488-1.03h-2.28a.88.88 0 0 1-.879-.88V2.51Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default IcoBook16;
