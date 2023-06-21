import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoUpload24 = ({ color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.55 4.24a.75.75 0 0 0-1.1 0L8.2 7.74a.75.75 0 1 0 1.1 1.02l1.95-2.1v7.59a.75.75 0 0 0 1.5 0V6.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5ZM4.75 14a.75.75 0 0 1 .75.75v1.5a2.25 2.25 0 0 0 2.25 2.25h8.5a2.25 2.25 0 0 0 2.25-2.25v-1.5a.75.75 0 0 1 1.5 0v1.5A3.75 3.75 0 0 1 16.25 20h-8.5A3.75 3.75 0 0 1 4 16.25v-1.5a.75.75 0 0 1 .75-.75Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoUpload24;
