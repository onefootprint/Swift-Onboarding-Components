import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoInfo24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.958 11.167H12v4.375M19.708 12a7.708 7.708 0 1 1-15.417 0 7.708 7.708 0 0 1 15.417 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8.146a.52.52 0 1 0 0 1.041.52.52 0 0 0 0-1.041Z"
        fill={theme.color[color]}
        stroke={theme.color[color]}
        strokeWidth={0.5}
      />
    </svg>
  );
};
export default IcoInfo24;
