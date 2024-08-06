import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoUserCircle24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M6.88 17.763c1.095-1.599 2.897-2.638 5.12-2.638 2.223 0 4.024 1.039 5.119 2.638m-10.238 0A7.68 7.68 0 0 0 12 19.708a7.679 7.679 0 0 0 5.119-1.945m-10.238 0a7.708 7.708 0 1 1 10.238 0m-2.41-7.43a2.708 2.708 0 1 1-5.418 0 2.708 2.708 0 0 1 5.417 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoUserCircle24;
