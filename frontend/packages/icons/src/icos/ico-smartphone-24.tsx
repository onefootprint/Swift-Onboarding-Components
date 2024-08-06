import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSmartphone24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.125 18.042h3.75m-6.25 2.5h8.75c.46 0 .833-.373.833-.834V4.292a.833.833 0 0 0-.833-.834h-8.75a.833.833 0 0 0-.833.834v15.416c0 .46.373.834.833.834Z"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoSmartphone24;
