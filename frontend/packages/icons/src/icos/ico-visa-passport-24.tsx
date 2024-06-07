import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoVisaPassport24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 4.75A.75.75 0 0 1 5.75 4h10.5A2.75 2.75 0 0 1 19 6.75v6.974a3.98 3.98 0 0 0-1.5-.33V6.75c0-.69-.56-1.25-1.25-1.25H6.5v13h7.062c.16.56.44 1.07.81 1.5H5.75a.75.75 0 0 1-.75-.75V4.75Zm9.572 9.822c-.4.402-.715.887-.916 1.428H9.75a.75.75 0 0 1 0-1.5h4.5c.115 0 .224.026.322.072ZM12 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM9 10a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm10.824 6.487a.59.59 0 1 0-.835-.835l-2.231 2.231-.934-.933a.59.59 0 1 0-.835.835l1.351 1.351a.591.591 0 0 0 .835 0l2.65-2.649Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoVisaPassport24;
