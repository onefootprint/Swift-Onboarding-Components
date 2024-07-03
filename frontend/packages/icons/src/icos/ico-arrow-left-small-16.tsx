import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoArrowLeftSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.74 11.8a.75.75 0 0 0 1.02-1.1l-2.1-1.95h8.59a.75.75 0 0 0 0-1.5H4.66l2.1-1.95a.75.75 0 1 0-1.02-1.1L2.242 7.45a.748.748 0 0 0 0 1.102L5.74 11.8Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowLeftSmall16;
