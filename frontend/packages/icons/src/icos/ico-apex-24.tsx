import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoApex24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <circle cx={17.748} cy={17.511} r={1.838} fill={theme.color[color]} />
      <rect
        x={14.07}
        y={9.698}
        width={3.676}
        height={9.65}
        rx={1.838}
        transform="rotate(27 14.07 9.698)"
        fill={theme.color[color]}
      />
      <rect
        x={11.1}
        y={4}
        width={3.676}
        height={16.084}
        rx={1.838}
        transform="rotate(27 11.1 4)"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoApex24;
