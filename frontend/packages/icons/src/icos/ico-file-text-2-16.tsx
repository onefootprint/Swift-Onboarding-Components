import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoFileText216 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M2.9 3.083c0-.62.503-1.123 1.123-1.123H8.89v3.464c0 .414.336.75.75.75h3.464v6.741c0 .62-.503 1.123-1.123 1.123h-7.96c-.62 0-1.122-.503-1.122-1.123V3.083Zm9.378 1.59-1.887-1.886v1.887h1.887ZM4.023.46A2.623 2.623 0 0 0 1.4 3.083v9.832a2.623 2.623 0 0 0 2.623 2.623h7.96a2.623 2.623 0 0 0 2.622-2.623V5.19a.75.75 0 0 0-.22-.53L10.405.68a.75.75 0 0 0-.53-.22H4.023Zm1.123 10.582a.75.75 0 0 1 .75-.75h4.213a.75.75 0 0 1 0 1.5H5.896a.75.75 0 0 1-.75-.75Zm.75-3.559a.75.75 0 1 0 0 1.5h4.213a.75.75 0 0 0 0-1.5H5.896Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFileText216;
