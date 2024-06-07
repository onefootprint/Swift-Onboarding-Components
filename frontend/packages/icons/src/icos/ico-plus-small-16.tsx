import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoPlusSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.55 2.75a.8.8 0 1 0-1.6 0v4.2h-4.2a.8.8 0 1 0 0 1.6h4.2v4.2a.8.8 0 0 0 1.6 0v-4.2h4.2a.8.8 0 0 0 0-1.6h-4.2v-4.2Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPlusSmall16;
