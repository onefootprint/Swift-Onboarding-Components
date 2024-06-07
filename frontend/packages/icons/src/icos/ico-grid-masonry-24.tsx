import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoGridMasonry24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
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
        d="M4 5.75C4 4.784 4.784 4 5.75 4h3.5c.966 0 1.75.784 1.75 1.75v12.5A1.75 1.75 0 0 1 9.25 20h-3.5A1.75 1.75 0 0 1 4 18.25V5.75Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h3.5a.25.25 0 0 0 .25-.25V5.75a.25.25 0 0 0-.25-.25h-3.5Zm7.25.25c0-.966.784-1.75 1.75-1.75h3.5c.966 0 1.75.784 1.75 1.75v3.5A1.75 1.75 0 0 1 18.25 11h-3.5A1.75 1.75 0 0 1 13 9.25v-3.5Zm1.75-.25a.25.25 0 0 0-.25.25v3.5c0 .138.112.25.25.25h3.5a.25.25 0 0 0 .25-.25v-3.5a.25.25 0 0 0-.25-.25h-3.5Zm0 7.5A1.75 1.75 0 0 0 13 14.75v3.5c0 .967.784 1.75 1.75 1.75h3.5A1.75 1.75 0 0 0 20 18.25v-3.5A1.75 1.75 0 0 0 18.25 13h-3.5Zm-.25 1.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoGridMasonry24;
