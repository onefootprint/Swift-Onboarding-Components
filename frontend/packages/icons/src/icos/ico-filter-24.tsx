import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFilter24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M18.042 5.125H5.958a.833.833 0 0 0-.833.833v2.363c0 .222.088.433.244.59l4.512 4.512a.833.833 0 0 1 .244.589v5.696l3.75-1.041v-4.655c0-.221.088-.433.244-.59l4.512-4.511a.833.833 0 0 0 .244-.59V5.958a.833.833 0 0 0-.833-.833Z"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoFilter24;
