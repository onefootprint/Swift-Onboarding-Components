import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoDotsHorizontal24 = ({
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
        d="M7.194 12.007a1.897 1.897 0 1 1-3.794 0 1.897 1.897 0 0 1 3.794 0Zm6.703 0a1.897 1.897 0 1 1-3.794 0 1.897 1.897 0 0 1 3.794 0Zm4.806 1.897a1.897 1.897 0 1 0 0-3.794 1.897 1.897 0 0 0 0 3.794Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoDotsHorizontal24;
