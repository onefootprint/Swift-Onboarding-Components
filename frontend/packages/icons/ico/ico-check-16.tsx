import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoCheck16 = ({ color = 'primary', style, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      style={style}
      aria-hidden="true"
    >
      <path
        d="m2 8.832 2.486 3.405a1.92 1.92 0 0 0 3.13-.04L14 2.96"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IcoCheck16;
