import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoClipboard24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.75 5.75A.25.25 0 0 1 10 5.5h4a.25.25 0 0 1 .25.25v1.5a.25.25 0 0 1-.25.25h-4a.25.25 0 0 1-.25-.25v-1.5ZM8.25 6v-.25C8.25 4.784 9.034 4 10 4h4c.966 0 1.75.784 1.75 1.75V6h.5A2.75 2.75 0 0 1 19 8.75v8.5A2.75 2.75 0 0 1 16.25 20h-8.5A2.75 2.75 0 0 1 5 17.25v-8.5A2.75 2.75 0 0 1 7.75 6h.5Zm7.482 1.5h.518c.69 0 1.25.56 1.25 1.25v8.5c0 .69-.56 1.25-1.25 1.25h-8.5c-.69 0-1.25-.56-1.25-1.25v-8.5c0-.69.56-1.25 1.25-1.25h.518C8.389 8.348 9.118 9 10 9h4a1.75 1.75 0 0 0 1.732-1.5ZM9 12.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoClipboard24;
