import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoArrowUpRight16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.623 2.05a.7.7 0 1 0 0 1.4h4.53L3.665 9.938a.7.7 0 1 0 .99.99l6.488-6.488v4.53a.7.7 0 1 0 1.4 0V2.75a.7.7 0 0 0-.7-.7h-6.22Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowUpRight16;
