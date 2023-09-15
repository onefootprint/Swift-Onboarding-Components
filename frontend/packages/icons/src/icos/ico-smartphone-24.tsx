import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoSmartphone24 = ({
  'aria-label': ariaLabel,
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
      aria-label={ariaLabel}
      className={className}
      role="img"
    >
      <path
        d="M4.65 6.75a2 2 0 0 1 2-2h6.5a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2h-6.5a2 2 0 0 1-2-2V6.75ZM10.15 16.75h-.5M18.65 14.25s.5-.906.5-2.25c0-1.344-.5-2.25-.5-2.25"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoSmartphone24;
