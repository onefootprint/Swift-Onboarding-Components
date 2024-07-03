import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCake24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.5 4.75a.75.75 0 0 0-1.5 0V7H5.75a.75.75 0 0 0-.75.75v8.879c-.61.504-1 1.267-1 2.121v.5c0 .414.336.75.75.75h14.5a.75.75 0 0 0 .75-.75v-.5c0-.854-.39-1.617-1-2.121V7.75a.75.75 0 0 0-.75-.75H15V4.75a.75.75 0 0 0-1.5 0V7h-3V4.75Zm7 8.126v3.135a2.791 2.791 0 0 0-.25-.011H6.75c-.084 0-.168.004-.25.011v-2.833a11.1 11.1 0 0 0 1.288.238c1.2.15 2.832.156 4.477-.464 1.34-.505 2.707-.511 3.761-.38a9.505 9.505 0 0 1 1.474.304Zm0-1.554V8.5h-11v3.124l.211.06c.303.08.74.178 1.263.244 1.054.131 2.421.125 3.761-.38 1.645-.62 3.277-.614 4.477-.464.51.064.95.154 1.288.238ZM5.525 18.5h12.95c-.116-.57-.62-1-1.225-1H6.75c-.605 0-1.11.43-1.225 1Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCake24;
