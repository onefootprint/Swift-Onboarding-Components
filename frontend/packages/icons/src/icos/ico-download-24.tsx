import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDownload24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12 4a.75.75 0 0 1 .75.75v7.59l1.95-2.1a.75.75 0 1 1 1.1 1.02l-3.249 3.498a.674.674 0 0 1-.035.036.748.748 0 0 1-1.067-.036L8.2 11.26a.75.75 0 1 1 1.1-1.02l1.95 2.1V4.75A.75.75 0 0 1 12 4ZM4.75 14a.75.75 0 0 1 .75.75v1.5a2.25 2.25 0 0 0 2.25 2.25h8.5a2.25 2.25 0 0 0 2.25-2.25v-1.5a.75.75 0 0 1 1.5 0v1.5A3.75 3.75 0 0 1 16.25 20h-8.5A3.75 3.75 0 0 1 4 16.25v-1.5a.75.75 0 0 1 .75-.75Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoDownload24;
