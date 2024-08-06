import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLayer0124 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 24 24"
    >
      <path
        d="m8.583 12-3.59 1.75a.833.833 0 0 0 0 1.499l6.642 3.24c.23.112.5.112.73 0l6.641-3.24a.833.833 0 0 0 0-1.498L15.416 12m-6.833 0-3.59-1.751a.833.833 0 0 1 0-1.498l6.642-3.24c.23-.112.5-.112.73 0l6.641 3.24a.833.833 0 0 1 0 1.498l-3.59 1.75m-6.833 0 3.052 1.49c.23.112.5.112.73 0l3.052-1.49"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoLayer0124;
