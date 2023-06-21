import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoArrowLeftSmall24 = ({
  color = 'primary',
  className,
  testID,
}: IconProps) => {
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
        d="M9.74 15.8a.75.75 0 0 0 1.02-1.1l-2.1-1.95h8.59a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1L6.242 11.45a.748.748 0 0 0 0 1.102L9.74 15.8Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowLeftSmall24;
