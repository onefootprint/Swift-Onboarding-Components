import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoQuote40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M13.501 7c-5.574 0-10.11 4.537-10.11 10.111V33h14.444V18.556H9.89V17.11c0-2.787 1.62-5.055 3.611-5.055h.723V7H13.5ZM32.28 7c-5.575 0-10.111 4.537-10.111 10.111V33h14.444V18.556h-7.944V17.11c0-2.787 1.62-5.055 3.611-5.055h.722V7h-.722Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoQuote40;
