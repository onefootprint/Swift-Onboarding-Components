import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoArrowUp16 = ({ color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.255 13.371a.75.75 0 0 0 1.5 0v-8.86l2.593 2.717a.75.75 0 0 0 1.085-1.035l-3.885-4.07a.75.75 0 0 0-1.085 0l-3.886 4.07a.75.75 0 1 0 1.086 1.035l2.592-2.716v8.86Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowUp16;
