import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoHeart40 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        clipRule="evenodd"
        d="M19.99 10.794C17.191 7.66 12.524 6.816 9.017 9.687 5.51 12.557 5.016 17.356 7.77 20.75l12.22 11.318L32.21 20.75c2.755-3.395 2.322-8.224-1.246-11.064-3.567-2.84-8.174-2.027-10.974 1.107Z"
        stroke={theme.color[color]}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoHeart40;
