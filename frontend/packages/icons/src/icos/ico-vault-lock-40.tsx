import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoVaultLock40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.68 10a1.5 1.5 0 1 0-3 0v5.176c.42-.115.863-.176 1.32-.176.59 0 1.155.102 1.68.29V10Zm1.762 6.373a4.992 4.992 0 0 1 1.457 2.623L29.57 16.3a1.5 1.5 0 0 0-1.5-2.598l-4.628 2.672Zm1.42 4.795a4.998 4.998 0 0 1-1.544 2.572L27.75 26.3a1.5 1.5 0 1 0 1.5-2.598l-4.387-2.533ZM21.68 24.71a5.007 5.007 0 0 1-3 .113V30a1.5 1.5 0 0 0 3 0v-5.29Zm-4.998-.97a4.997 4.997 0 0 1-1.545-2.573l-4.387 2.533a1.5 1.5 0 1 0 1.5 2.598l4.432-2.559ZM15.1 18.995a4.993 4.993 0 0 1 1.457-2.623l-4.629-2.672a1.5 1.5 0 1 0-1.5 2.598l4.672 2.697Z"
        fill={theme.color[color]}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.75 20c0-7.87 6.38-14.25 14.25-14.25S34.25 12.13 34.25 20 27.87 34.25 20 34.25 5.75 27.87 5.75 20ZM20 2.25C10.197 2.25 2.25 10.197 2.25 20S10.197 37.75 20 37.75 37.75 29.803 37.75 20 29.803 2.25 20 2.25ZM26 20a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-6 3.6a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Zm0-1.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoVaultLock40;
