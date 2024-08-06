import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoStore40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
      viewBox="0 0 40 40"
    >
      <path
        d="m35 13.333-4.5-6a1.667 1.667 0 0 0-1.333-.666H10.833c-.524 0-1.018.247-1.333.666l-4.5 6m30 0V15c0 1.48-.644 2.811-1.667 3.727M35 13.333H5m0 0V15c0 1.48.644 2.811 1.667 3.727m26.666 0A5 5 0 0 1 25 15m8.333 3.727v12.94c0 .92-.746 1.666-1.666 1.666H8.333c-.92 0-1.666-.746-1.666-1.666v-12.94m0 0A5 5 0 0 0 15 15m10 0v-1.667M25 15a5 5 0 1 1-10 0m0 0v-1.667m8.333 20v-5a3.333 3.333 0 1 0-6.666 0v5"
        stroke={theme.color[color]}
        strokeWidth={3.333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoStore40;
