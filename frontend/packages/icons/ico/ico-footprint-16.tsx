import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoFootprint16 = ({ color = 'primary', style, testID }: IconProps) => {
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
        d="M10 9.5h2V7.73a2 2 0 1 1 0-3.46V2H4v12h3.5v-2A2.5 2.5 0 0 1 10 9.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoFootprint16;
