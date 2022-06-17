import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../src/types';

const IcoMenu16 = ({ color = 'primary', className, testID }: IconProps) => {
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
        d="M.9 2.54a.75.75 0 0 1 .75-.75h12.688a.75.75 0 0 1 0 1.5H1.65a.75.75 0 0 1-.75-.75Zm0 10.938a.75.75 0 0 1 .75-.75h12.688a.75.75 0 0 1 0 1.5H1.65a.75.75 0 0 1-.75-.75Zm.75-6.22a.75.75 0 0 0 0 1.5h12.688a.75.75 0 0 0 0-1.5H1.65Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoMenu16;
