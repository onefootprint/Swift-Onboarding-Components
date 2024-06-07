import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoFileText24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.75 5.5c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25h8.5c.69 0 1.25-.56 1.25-1.25V11h-2.75A2.75 2.75 0 0 1 12 8.25V5.5H7.75Zm5.75 1.06 2.94 2.94h-1.69c-.69 0-1.25-.56-1.25-1.25V6.56ZM5 6.75A2.75 2.75 0 0 1 7.75 4h5a.75.75 0 0 1 .53.22l5.5 5.5c.141.14.22.331.22.53v7A2.75 2.75 0 0 1 16.25 20h-8.5A2.75 2.75 0 0 1 5 17.25V6.75Zm3 9a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75ZM8.75 12a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFileText24;
