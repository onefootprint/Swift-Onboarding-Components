import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoSearch16 = ({ color = 'primary', style, testID }: IconProps) => {
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
        d="m14 14-3.103-3.103M2 7.172a5.172 5.172 0 1 1 10.345 0A5.172 5.172 0 0 1 2 7.172Z"
        stroke={theme.color[color]}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IcoSearch16;
