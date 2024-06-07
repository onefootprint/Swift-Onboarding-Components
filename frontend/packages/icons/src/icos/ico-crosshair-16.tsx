import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoCrosshair16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.004 1.05a.65.65 0 0 1 .65.65v.254a6.087 6.087 0 0 1 5.4 5.4h.255a.65.65 0 1 1 0 1.3h-.254a6.087 6.087 0 0 1-5.4 5.4v.255a.65.65 0 1 1-1.3 0v-.254a6.087 6.087 0 0 1-5.401-5.4H1.7a.65.65 0 1 1 0-1.3h.254a6.087 6.087 0 0 1 5.4-5.401V1.7a.65.65 0 0 1 .65-.65Zm-4.74 7.604h2.349a.65.65 0 0 0 0-1.3h-2.35a4.788 4.788 0 0 1 4.091-4.09v2.35a.65.65 0 0 0 1.3 0v-2.35a4.788 4.788 0 0 1 4.091 4.09h-2.35a.65.65 0 1 0 0 1.3h2.35a4.788 4.788 0 0 1-4.09 4.091v-2.35a.65.65 0 1 0-1.3 0v2.35a4.788 4.788 0 0 1-4.092-4.09Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCrosshair16;
