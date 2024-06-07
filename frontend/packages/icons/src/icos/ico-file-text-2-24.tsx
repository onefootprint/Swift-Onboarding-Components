import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoFileText224 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M6.5 6.75c0-.69.56-1.25 1.25-1.25H13v3.75c0 .414.336.75.75.75h3.75v7.25c0 .69-.56 1.25-1.25 1.25h-8.5c-.69 0-1.25-.56-1.25-1.25V6.75ZM16.69 8.5 14.5 6.31V8.5h2.19ZM7.75 4A2.75 2.75 0 0 0 5 6.75v10.5A2.75 2.75 0 0 0 7.75 20h8.5A2.75 2.75 0 0 0 19 17.25V9a.75.75 0 0 0-.22-.53l-4.25-4.25A.75.75 0 0 0 14 4H7.75ZM9 15.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm.75-3.75a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFileText224;
