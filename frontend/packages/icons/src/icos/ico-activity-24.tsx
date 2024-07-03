import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoActivity24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.265 4a.75.75 0 0 1 .714.574l2.807 11.63 1.24-4.647A.75.75 0 0 1 15.75 11h3.5a.75.75 0 0 1 0 1.5h-2.924l-1.851 6.943a.75.75 0 0 1-1.454-.017L10.189 7.694l-1.218 4.262a.75.75 0 0 1-.721.544h-3.5a.75.75 0 0 1 0-1.5h2.934L9.53 4.544A.75.75 0 0 1 10.265 4Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoActivity24;
