import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPassport24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5 4.75A.75.75 0 0 1 5.75 4h10.5A2.75 2.75 0 0 1 19 6.75v10.5A2.75 2.75 0 0 1 16.25 20H5.75a.75.75 0 0 1-.75-.75V4.75Zm1.5.75v13h9.75c.69 0 1.25-.56 1.25-1.25V6.75c0-.69-.56-1.25-1.25-1.25H6.5Zm5.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM9 10a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm.75 4.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPassport24;
