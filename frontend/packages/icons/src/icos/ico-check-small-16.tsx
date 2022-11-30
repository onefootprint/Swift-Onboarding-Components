import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoCheckSmall16 = ({
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
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M11.193 5.082a.47.47 0 1 1 .665.665l-5.17 5.169a.47.47 0 0 1-.664 0l-1.88-1.88a.47.47 0 1 1 .665-.664l1.547 1.547 4.837-4.837Z"
        fill={theme.color[color]}
        stroke={theme.color[color]}
        strokeWidth={0.5}
      />
    </svg>
  );
};
export default IcoCheckSmall16;
