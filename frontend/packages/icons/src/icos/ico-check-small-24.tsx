import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoCheckSmall24 = ({
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
        d="M16.395 8.18a.587.587 0 0 0-.404.178l-6.046 6.046-1.934-1.934a.587.587 0 1 0-.83.83l2.35 2.35a.588.588 0 0 0 .83 0l6.461-6.461a.587.587 0 0 0-.427-1.009Z"
        fill={theme.color[color]}
        stroke={theme.color[color]}
        strokeWidth={0.5}
      />
      <path
        d="M16.395 8.18a.587.587 0 0 0-.404.178l-6.046 6.046-1.934-1.934a.587.587 0 1 0-.83.83l2.35 2.35a.588.588 0 0 0 .83 0l6.461-6.461a.587.587 0 0 0-.427-1.009Z"
        fill={theme.color[color]}
        stroke={theme.color[color]}
        strokeWidth={0.5}
      />
    </svg>
  );
};
export default IcoCheckSmall24;
