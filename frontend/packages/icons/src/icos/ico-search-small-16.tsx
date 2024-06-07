import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoSearchSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="m13.5 13.5-2.845-2.845M2.5 7.241a4.741 4.741 0 1 1 9.483 0 4.741 4.741 0 0 1-9.483 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoSearchSmall16;
