import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoWww24 = ({
  'aria-label': ariaLabel,
  color = 'primary',
  className,
  testID,
}: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={20}
      height={20}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
    >
      <path
        d="M18 10a8 8 0 0 0-8-8m8 8H2m16 0c0 .766-.107 1.506-.309 2.207M10 2a8 8 0 0 0-8 8m8-8c-1.372 0-3.586 3.034-3.586 8 0 .786.055 1.523.154 2.207M10 2c1.372 0 3.586 3.034 3.586 8 0 .786-.055 1.523-.154 2.207M2 10c0 .766.107 1.506.309 2.207m.243 3.034L3.103 18l1.38-1.655L5.863 18l.55-2.759m1.656 0L8.621 18 10 16.345 11.38 18l.551-2.759m1.655 0L14.138 18l1.38-1.655L16.896 18l.551-2.759"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoWww24;
