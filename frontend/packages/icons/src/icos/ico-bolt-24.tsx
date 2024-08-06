import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBolt24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M18.305 9.5H13.25a.417.417 0 0 1-.417-.417V4.001a.417.417 0 0 0-.763-.231L5.349 13.852a.417.417 0 0 0 .346.648h5.055c.23 0 .417.187.417.417v5.082c0 .412.534.574.763.231l6.721-10.082a.417.417 0 0 0-.346-.648Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoBolt24;
