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
        d="m14.5 14.5-3.362-3.362M1.5 7.103a5.603 5.603 0 1 1 11.207 0 5.603 5.603 0 0 1-11.207 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IcoSearch16;
