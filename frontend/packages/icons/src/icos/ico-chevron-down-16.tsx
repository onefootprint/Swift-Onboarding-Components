import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoChevronDown16 = ({
  color = 'primary',
  className,
  testID,
}: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M11.25 6.25 8 9.75l-3.25-3.5"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IcoChevronDown16;
