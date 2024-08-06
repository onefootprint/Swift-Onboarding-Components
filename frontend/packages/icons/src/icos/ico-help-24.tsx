import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoHelp24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m17.416 6.583-3.028 3.029m-4.78 4.78-3.025 3.025m0-10.834 3.024 3.024m4.781 4.781 3.028 3.029M19.709 12a7.708 7.708 0 1 1-15.417 0 7.708 7.708 0 0 1 15.417 0Zm-4.166 0a3.542 3.542 0 1 1-7.084 0 3.542 3.542 0 0 1 7.083 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.25}
      />
    </svg>
  );
};
export default IcoHelp24;
