import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoMinusBig16 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M14.25 8H1.75"
        stroke={theme.color[color]}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IcoMinusBig16;
