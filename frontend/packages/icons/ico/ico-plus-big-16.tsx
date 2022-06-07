import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../src/types';

const IcoPlusBig16 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.85 1.75a.85.85 0 0 0-1.7 0v5.4h-5.4a.85.85 0 0 0 0 1.7h5.4v5.4a.85.85 0 0 0 1.7 0v-5.4h5.4a.85.85 0 0 0 0-1.7h-5.4v-5.4Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoPlusBig16;
