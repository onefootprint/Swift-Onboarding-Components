import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLeaf24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12 12v-.833a5.833 5.833 0 0 0-5.833-5.834h-.833v.834A5.833 5.833 0 0 0 11.166 12H12Zm0 0v1.667m0 0a5.833 5.833 0 0 1 5.834-5.834h.833v.834a5.833 5.833 0 0 1-5.834 5.833H12m0-.833v.833m0 0v4.167"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoLeaf24;
