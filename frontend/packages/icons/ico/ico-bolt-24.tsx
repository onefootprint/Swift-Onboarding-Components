import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoBolt24 = ({ color = 'primary', style, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      style={style}
    >
      <path
        d="M10.75 13.25h-4l6.5-8.5v6h4l-6.5 8.5v-6Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IcoBolt24;
