import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFlag24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.958 14.57V5.665a.77.77 0 0 1 .475-.724c.632-.254 1.808-.65 2.978-.65 1.719 0 3.46 1.713 5.178 1.713.787 0 1.578-.18 2.203-.375.59-.183 1.25.242 1.25.86v7.562a.77.77 0 0 1-.474.724c-.633.253-1.81.65-2.979.65-1.718 0-3.46-1.713-5.178-1.713-1.719 0-3.452.856-3.452.856Zm0 0v5.138"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoFlag24;
