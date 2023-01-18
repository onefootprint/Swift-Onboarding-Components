import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoCheck24 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M17.274 7.41a.705.705 0 0 0-.484.214l-7.255 7.255-2.322-2.321a.704.704 0 1 0-.996.997l2.82 2.819a.705.705 0 0 0 .996 0l7.753-7.754a.705.705 0 0 0-.512-1.21Z"
        fill={theme.color[color]}
        stroke={theme.color[color]}
        strokeWidth={0.5}
      />
    </svg>
  );
};
export default IcoCheck24;
