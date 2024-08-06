import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWww24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M19.708 12a7.708 7.708 0 1 1-15.417 0 7.708 7.708 0 0 1 15.417 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path
        d="m14.213 9.275-3.42.933a.833.833 0 0 0-.585.585l-.933 3.42c-.084.311.201.597.512.512l3.42-.933a.834.834 0 0 0 .585-.585l.933-3.42a.417.417 0 0 0-.512-.512Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoWww24;
