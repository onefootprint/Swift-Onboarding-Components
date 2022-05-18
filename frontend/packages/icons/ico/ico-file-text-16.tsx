import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoFileText16 = ({ color = 'primary', style, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.81 3.16a.9.9 0 0 0-.9.9v7.875a.9.9 0 0 0 .9.9h6.375a.9.9 0 0 0 .9-.9v-4.65H10.06a2.1 2.1 0 0 1-2.1-2.1V3.16H4.81Zm4.35.849 2.076 2.076H10.06a.9.9 0 0 1-.9-.9V4.009Zm-6.45.051c0-1.16.94-2.1 2.1-2.1h3.75a.6.6 0 0 1 .424.176L13.11 6.26a.6.6 0 0 1 .176.424v5.25a2.1 2.1 0 0 1-2.1 2.1H4.81a2.1 2.1 0 0 1-2.1-2.1V4.06Zm2.25 6.75a.6.6 0 0 1 .6-.6h4.875a.6.6 0 1 1 0 1.2H5.56a.6.6 0 0 1-.6-.6Zm.6-2.85a.6.6 0 0 0 0 1.2h1.875a.6.6 0 0 0 0-1.2H5.56Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoFileText16;
