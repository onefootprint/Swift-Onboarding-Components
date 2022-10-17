import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoSpinner24 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2a10 10 0 0 1 10 10h-2a7.999 7.999 0 0 0-8-8V2Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSpinner24;
