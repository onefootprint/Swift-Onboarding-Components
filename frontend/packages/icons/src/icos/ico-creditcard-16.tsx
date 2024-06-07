import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoCreditcard16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M2.4 4.334c0-.593.48-1.074 1.074-1.074h9.05c.594 0 1.075.48 1.075 1.074v1.505H2.4V4.334Zm0 2.805v4.522c0 .593.48 1.074 1.074 1.074h9.05c.594 0 1.075-.481 1.075-1.074V7.139H2.4ZM3.474 1.96A2.374 2.374 0 0 0 1.1 4.334v7.327a2.374 2.374 0 0 0 2.374 2.374h9.05A2.374 2.374 0 0 0 14.9 11.66V4.334a2.374 2.374 0 0 0-2.374-2.374H3.474Zm.212 7.977a.65.65 0 0 1 .65-.65h2.155a.65.65 0 0 1 0 1.3H4.336a.65.65 0 0 1-.65-.65Zm7.546-.65a.65.65 0 1 0 0 1.3h.43a.65.65 0 1 0 0-1.3h-.43Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCreditcard16;
