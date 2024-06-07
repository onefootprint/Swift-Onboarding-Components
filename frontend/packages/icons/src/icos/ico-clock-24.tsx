import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoClock24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.5 12a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0ZM12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-.75 4v4.31l.22.22 2 2 1.06-1.06-1.78-1.78V8h-1.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoClock24;
