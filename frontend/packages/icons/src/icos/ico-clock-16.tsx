import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoClock16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.4 7.998a5.598 5.598 0 1 1 11.196 0 5.598 5.598 0 0 1-11.196 0ZM7.998 1a6.998 6.998 0 1 0 0 13.996A6.998 6.998 0 0 0 7.998 1Zm-.7 3.523v3.765l.205.205 1.738 1.738.99-.99-1.533-1.533V4.523h-1.4Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoClock16;
