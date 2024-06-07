import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoChart16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.26 4.06a.8.8 0 0 1 .8-.8h7.875a.8.8 0 0 1 .8.8v7.875a.8.8 0 0 1-.8.8H4.06a.8.8 0 0 1-.8-.8V4.06Zm.8-2.2a2.2 2.2 0 0 0-2.2 2.2v7.875a2.2 2.2 0 0 0 2.2 2.2h7.875a2.2 2.2 0 0 0 2.2-2.2V4.06a2.2 2.2 0 0 0-2.2-2.2H4.06Zm2.1 4.45a.6.6 0 1 0-1.2 0v4.125a.6.6 0 1 0 1.2 0V6.31Zm4.275-.6a.6.6 0 0 1 .6.6v4.125a.6.6 0 1 1-1.2 0V6.31a.6.6 0 0 1 .6-.6ZM8.597 8.56a.6.6 0 1 0-1.2 0v1.875a.6.6 0 1 0 1.2 0V8.56Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChart16;
