import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoSpinner40 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 4a16 16 0 0 1 16 16h-3.2A12.8 12.8 0 0 0 20 7.2V4Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSpinner40;
