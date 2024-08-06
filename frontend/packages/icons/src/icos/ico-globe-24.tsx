import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoGlobe24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12.208 19.917a7.708 7.708 0 0 0 0-15.417m0 15.417a7.708 7.708 0 0 1 0-15.417m0 15.417c-1.956 0-3.541-3.452-3.541-7.709S10.252 4.5 12.208 4.5m0 15.417c1.956 0 3.542-3.452 3.542-7.709S14.164 4.5 12.208 4.5m7.5 7.708h-15"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="square"
      />
    </svg>
  );
};
export default IcoGlobe24;
