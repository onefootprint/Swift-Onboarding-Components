import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPencil24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m13.25 7 1.91-1.91a.833.833 0 0 1 1.18 0l2.57 2.57a.833.833 0 0 1 0 1.18L17 10.75M13.25 7l-8.506 8.506a.833.833 0 0 0-.244.59v2.57c0 .46.373.834.833.834h2.572a.833.833 0 0 0 .59-.244L17 10.75M13.25 7 17 10.75"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoPencil24;
