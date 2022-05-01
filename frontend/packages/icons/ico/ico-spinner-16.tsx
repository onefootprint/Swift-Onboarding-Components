import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoSpinner16 = ({ color = 'primary', style, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      style={style}
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="M8 0a8 8 0 0 1 8 8h-1.6A6.399 6.399 0 0 0 8 1.6V0Z"
          fill={theme.colors[color]}
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

export default IcoSpinner16;
