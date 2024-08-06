import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoGridMasonry24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.125 6.458c0-.466 0-.7.09-.878a.833.833 0 0 1 .365-.364c.178-.091.412-.091.878-.091h4.084v3.75H5.125V6.458ZM13.459 15.125h5.416v2.417c0 .466 0 .7-.09.878a.833.833 0 0 1-.365.364c-.178.091-.411.091-.878.091h-4.084v-3.75ZM5.125 11.792h5.417v7.083H6.458c-.466 0-.7 0-.878-.09a.833.833 0 0 1-.364-.365c-.091-.178-.091-.412-.091-.878v-5.75ZM13.459 5.125h4.083c.467 0 .7 0 .878.09.157.08.284.208.364.365.091.178.091.412.091.878v5.75H13.46V5.125Z"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoGridMasonry24;
