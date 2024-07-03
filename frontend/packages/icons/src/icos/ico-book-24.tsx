import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBook24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M6.5 6.75c0-.69.56-1.25 1.25-1.25H9v12H7.75c-.69 0-1.25-.56-1.25-1.25v-9.5ZM9 19v.25a.75.75 0 0 0 1.5 0V19h5.75A2.75 2.75 0 0 0 19 16.25v-9.5A2.75 2.75 0 0 0 16.25 4h-8.5A2.75 2.75 0 0 0 5 6.75v9.5A2.75 2.75 0 0 0 7.75 19H9Zm1.5-13.5h5.75c.69 0 1.25.56 1.25 1.25v9.5c0 .69-.56 1.25-1.25 1.25H10.5v-12ZM13.75 8a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5h-.5ZM13 11.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoBook24;
