import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBank24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.5 4.192a.75.75 0 0 1 1 0l7.25 6.5a.75.75 0 0 1-.5 1.308H19v6.5h.25a.75.75 0 0 1 0 1.5H4.75a.75.75 0 0 1 0-1.5H5V12h-.25a.75.75 0 0 1-.5-1.308l7.25-6.5ZM6.5 18.5H9V12H6.5v6.5Zm4 0h3V12h-3v6.5Zm4.5 0h2.5V12H15v6.5Zm2.29-8L12 5.757 6.71 10.5h10.58Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoBank24;
