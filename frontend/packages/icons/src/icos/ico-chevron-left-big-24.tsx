import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoChevronLeftBig24 = ({
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
      role="img"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M14.824 6.75 9.17 12l5.654 5.25"
        stroke={theme.color[color]}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IcoChevronLeftBig24;
