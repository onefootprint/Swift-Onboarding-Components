import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoClose16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12.868 4.331a.85.85 0 1 0-1.203-1.202L7.998 6.796 4.331 3.13a.85.85 0 1 0-1.202 1.202l3.667 3.667-3.667 3.667a.85.85 0 0 0 1.202 1.203L7.998 9.2l3.667 3.668a.85.85 0 1 0 1.203-1.203L9.2 7.998l3.668-3.667Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoClose16;
