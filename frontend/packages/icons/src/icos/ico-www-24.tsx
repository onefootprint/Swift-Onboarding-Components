import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWww24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M20 12a8 8 0 0 0-8-8m8 8H4m16 0c0 .766-.107 1.506-.309 2.207M12 4a8 8 0 0 0-8 8m8-8c-1.372 0-3.586 3.034-3.586 8 0 .786.055 1.523.154 2.207M12 4c1.372 0 3.586 3.034 3.586 8 0 .786-.055 1.523-.154 2.207M4 12c0 .766.107 1.506.309 2.207m.243 3.034L5.103 20l1.38-1.655L7.863 20l.55-2.759m1.656 0L10.621 20 12 18.345 13.38 20l.551-2.759m1.655 0L16.138 20l1.38-1.655L18.896 20l.551-2.759"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoWww24;
