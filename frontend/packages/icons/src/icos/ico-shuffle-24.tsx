import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoShuffle24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M4.292 17.156h1.367c.221 0 .433-.087.59-.244l9.048-9.043a.834.834 0 0 1 .59-.244h3.196M4.292 6.792h1.321c.221 0 .433.087.59.244l2.88 2.88m10 6.38h-3.308a.834.834 0 0 1-.594-.248l-1.931-1.965m3.958-8.958 2.5 2.5-2.5 2.5m-.07 3.594 2.57 2.578-2.57 2.578"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoShuffle24;
