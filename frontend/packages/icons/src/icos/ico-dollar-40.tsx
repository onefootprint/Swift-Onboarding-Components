import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoDollar40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
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
        d="M6.25 19.998c0-7.593 6.155-13.748 13.748-13.748 7.593 0 13.748 6.155 13.748 13.748 0 7.593-6.155 13.748-13.748 13.748-7.593 0-13.748-6.155-13.748-13.748ZM19.998 3.25c-9.25 0-16.748 7.498-16.748 16.748s7.498 16.748 16.748 16.748 16.748-7.498 16.748-16.748S29.248 3.25 19.998 3.25Zm1.5 7.81v.603h3.232a1.5 1.5 0 0 1 0 3h-6.046a1.918 1.918 0 1 0 0 3.835h2.629a4.918 4.918 0 0 1 .185 9.832v.607a1.5 1.5 0 1 1-3 0v-.603h-3.232a1.5 1.5 0 0 1 0-3h6.047a1.918 1.918 0 0 0 0-3.836h-2.63a4.918 4.918 0 0 1-.185-9.832v-.606a1.5 1.5 0 1 1 3 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoDollar40;
