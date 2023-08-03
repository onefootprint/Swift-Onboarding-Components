import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoNetwork16 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={17}
      height={17}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5.12 4.932h.008m-.009 6.62h.009m6.612-6.62h.008m-.008 6.62h.008m-2.284-3.31a1.035 1.035 0 1 1-2.069 0 1.035 1.035 0 0 1 2.07 0Zm0-4.965a1.034 1.034 0 1 1-2.069 0 1.034 1.034 0 0 1 2.07 0Zm4.966 4.965a1.035 1.035 0 1 1-2.07 0 1.035 1.035 0 0 1 2.07 0Zm-9.931 0a1.035 1.035 0 1 1-2.07 0 1.035 1.035 0 0 1 2.07 0Zm4.965 4.966a1.034 1.034 0 1 1-2.069 0 1.034 1.034 0 0 1 2.07 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoNetwork16;
