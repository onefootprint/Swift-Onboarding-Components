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
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.5 12c0-1.525.525-2.927 1.404-4.035l1.787 1.787A3.982 3.982 0 0 0 8 12c0 .834.255 1.607.691 2.248l-1.787 1.787A6.472 6.472 0 0 1 5.5 12Zm4.252-3.309L7.965 6.904A6.472 6.472 0 0 1 12 5.5c1.525 0 2.927.525 4.035 1.404l-1.787 1.787A3.981 3.981 0 0 0 12 8c-.834 0-1.607.255-2.248.691Zm5.557 1.06c.436.642.691 1.415.691 2.249 0 .834-.255 1.607-.691 2.248l1.787 1.787A6.472 6.472 0 0 0 18.5 12a6.473 6.473 0 0 0-1.404-4.035l-1.787 1.787Zm-1.06 5.558A3.982 3.982 0 0 1 12 16a3.982 3.982 0 0 1-2.248-.691l-1.787 1.787A6.473 6.473 0 0 0 12 18.5a6.472 6.472 0 0 0 4.035-1.404l-1.787-1.787ZM12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-2.5 8a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoHelp24;
