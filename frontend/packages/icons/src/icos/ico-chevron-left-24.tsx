import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoChevronLeft24 = ({
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
        d="M13.25 8.75 9.75 12l3.5 3.25"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IcoChevronLeft24;
