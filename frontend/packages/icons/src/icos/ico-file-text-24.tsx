import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFileText24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12.625 4.708v4.167c0 .46.373.833.834.833h4.166m-8.333 3.334h2.917m-2.917 3.333h5.417M6.792 4.292h5.488c.221 0 .433.087.59.244l4.928 4.928a.833.833 0 0 1 .244.59v8.821c0 .46-.373.833-.834.833H6.793a.833.833 0 0 1-.833-.833V5.125c0-.46.373-.833.833-.833Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
};
export default IcoFileText24;
