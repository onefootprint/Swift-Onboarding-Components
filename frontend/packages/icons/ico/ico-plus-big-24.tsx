import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoPlusBig24 = ({ color = 'primary', style, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.1 5.75a.9.9 0 0 0-1.8 0v5.35H5.95a.9.9 0 1 0 0 1.8h5.35v5.35a.9.9 0 1 0 1.8 0V12.9h5.35a.9.9 0 0 0 0-1.8H13.1V5.75Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoPlusBig24;
