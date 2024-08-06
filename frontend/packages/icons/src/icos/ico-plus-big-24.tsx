import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPlusBig24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12 5.333V12m0 0v6.667M12 12H5.333M12 12h6.667"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
};
export default IcoPlusBig24;
