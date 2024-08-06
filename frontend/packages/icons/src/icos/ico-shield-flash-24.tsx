import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoShieldFlash24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M18.667 7.386v4.54c0 4.11-3.278 5.877-6.582 7.66l-.085.046-.084-.046c-3.305-1.783-6.583-3.55-6.583-7.66v-4.54c0-.355.226-.672.563-.788l5.833-2.005a.834.834 0 0 1 .542 0l5.833 2.005a.833.833 0 0 1 .563.788Z"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m12.388 8.25-1.831 3.02c0 .106.086.193.193.193h2.964c.155 0 .247.172.161.3l-2.5 3.987"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoShieldFlash24;
