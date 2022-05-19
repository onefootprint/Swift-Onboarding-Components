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
      aria-hidden="true"
    >
      <path
        d="M6.886 9.12H3.3L9.128 1.5v5.38h3.586L6.886 14.5V9.12Z"
        stroke={theme.color[color]}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IcoBolt16;
