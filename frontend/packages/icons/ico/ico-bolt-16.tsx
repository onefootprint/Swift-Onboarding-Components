import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoBolt16 = ({ color = 'primary', style, testID }: IconProps) => {
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
      <path
        d="M6.97 9.034H3.66L9.04 2v4.966h3.31L6.97 14V9.034Z"
        stroke={theme.colors[color]}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IcoBolt16;
