import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoIdBack24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <rect
        width={16}
        height={16}
        rx={2}
        transform="matrix(1 0 0 -1 4 20)"
        stroke={theme.color[color]}
        strokeWidth={1.5}
      />
      <rect x={6.667} y={6.933} width={10.667} height={1.28} rx={0.64} fill={theme.color[color]} />
      <rect x={9.867} y={9.6} width={7.467} height={1.28} rx={0.64} fill={theme.color[color]} />
      <path
        d="M6.667 15.048c0-.505.53-.915 1.185-.915h8.296c.655 0 1.185.41 1.185.915v1.371c0 .505-.53.914-1.185.914H7.852c-.655 0-1.185-.409-1.185-.914v-1.371Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoIdBack24;
