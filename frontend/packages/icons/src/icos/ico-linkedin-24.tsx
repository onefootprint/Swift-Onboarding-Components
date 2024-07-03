import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLinkedin24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M18.546 4H5.455C4.65 4 4 4.65 4 5.455v13.09C4 19.35 4.65 20 5.455 20h13.09C19.35 20 20 19.35 20 18.546V5.455C20 4.65 19.35 4 18.546 4ZM9.056 17.09H6.912v-6.902h2.145v6.903ZM7.963 9.2a1.25 1.25 0 1 1 0-2.501 1.25 1.25 0 0 1 0 2.502Zm9.13 7.89H14.95v-3.356c0-.8-.015-1.83-1.115-1.83-1.117 0-1.288.871-1.288 1.772v3.415h-2.144v-6.903h2.058v.943h.03c.286-.543.985-1.115 2.029-1.115 2.172 0 2.574 1.43 2.574 3.289v3.786Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLinkedin24;
