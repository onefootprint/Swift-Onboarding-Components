import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCheckCircle40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.005 4.85c-8.37 0-15.155 6.785-15.155 15.155s6.785 15.154 15.155 15.154 15.154-6.785 15.154-15.154c0-8.37-6.785-15.155-15.154-15.155ZM7.85 20.005c0-6.713 5.442-12.155 12.155-12.155 6.713 0 12.154 5.442 12.154 12.155 0 6.713-5.441 12.154-12.154 12.154S7.85 26.718 7.85 20.005Zm17.693-3.491a1.5 1.5 0 1 0-2.602-1.493l-4.32 7.528a.383.383 0 0 1-.68-.028l-.816-1.74a1.5 1.5 0 1 0-2.716 1.273l.817 1.741c1.163 2.479 4.635 2.622 5.998.247l4.32-7.529Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCheckCircle40;
