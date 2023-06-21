import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoBook24 = ({ color = 'primary', className, testID }: IconProps) => {
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
        d="M19.25 5.75a1 1 0 0 0-1-1H14a2 2 0 0 0-2 2v12.5l.828-.828a4 4 0 0 1 2.829-1.172h2.593a1 1 0 0 0 1-1V5.75ZM4.75 5.75a1 1 0 0 1 1-1H10a2 2 0 0 1 2 2v12.5l-.828-.828a4 4 0 0 0-2.829-1.172H5.75a1 1 0 0 1-1-1V5.75Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoBook24;
