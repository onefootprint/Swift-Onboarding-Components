import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoCheck24 = ({ color = 'primary', style, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      style={style}
      aria-hidden="true"
    >
      <path
        d="m5.75 12.877 2.59 3.547a2 2 0 0 0 3.26-.042l6.65-9.622"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IcoCheck24;
