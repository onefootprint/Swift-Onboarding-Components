import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoCheck16 = ({ color = 'primary', className, testID }: IconProps) => {
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
        d="M12.39 3.986a.646.646 0 1 1 .914.914l-7.107 7.107a.646.646 0 0 1-.914 0L2.7 9.422a.646.646 0 1 1 .913-.913l2.128 2.127 6.65-6.65Z"
        fill={theme.color[color]}
        stroke={theme.color[color]}
        strokeWidth={0.5}
      />
    </svg>
  );
};
export default IcoCheck16;
