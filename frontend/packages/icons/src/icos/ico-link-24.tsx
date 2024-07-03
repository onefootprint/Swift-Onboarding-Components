import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLink24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.469 5.463a4.997 4.997 0 1 1 7.066 7.067l-1.251 1.25a.75.75 0 1 1-1.06-1.06l1.25-1.251a3.497 3.497 0 0 0-4.944-4.945l-1.252 1.251a.75.75 0 0 1-1.06-1.06l1.251-1.252Zm-3.694 4.755a.75.75 0 0 1 0 1.06l-1.25 1.252a3.496 3.496 0 1 0 4.944 4.944l1.251-1.25a.75.75 0 0 1 1.06 1.06l-1.25 1.251a4.997 4.997 0 1 1-7.067-7.066l1.252-1.251a.75.75 0 0 1 1.06 0Zm7.007.06a.75.75 0 1 0-1.061-1.061L9.217 13.72a.75.75 0 0 0 1.06 1.06l4.505-4.504Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLink24;
