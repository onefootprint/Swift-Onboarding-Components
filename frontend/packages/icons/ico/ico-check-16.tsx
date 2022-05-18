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
        d="m3 8.703 2.072 2.838a1.6 1.6 0 0 0 2.608-.034L13 3.81"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IcoCheck16;
