import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoApple16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M14.44 11.505c-.352.781-.522 1.13-.974 1.82-.633.962-1.526 2.165-2.63 2.172-.981.01-1.235-.64-2.568-.629-1.333.006-1.61.642-2.594.632-1.104-.01-1.949-1.093-2.582-2.055-1.77-2.696-1.957-5.858-.863-7.54.774-1.191 1.998-1.892 3.149-1.892 1.171 0 1.908.643 2.876.643.94 0 1.512-.644 2.867-.644 1.024 0 2.107.558 2.881 1.52-2.532 1.39-2.12 5.005.437 5.973Zm-4.348-8.57c.493-.633.867-1.526.73-2.435-.803.055-1.743.568-2.292 1.233-.498.606-.91 1.506-.75 2.376.878.028 1.786-.496 2.312-1.174Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoApple16;
