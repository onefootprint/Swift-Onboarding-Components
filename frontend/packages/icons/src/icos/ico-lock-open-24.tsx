import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLockOpen24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.03 6.747C9.46 6.157 10.29 5.5 12 5.5l2.676 1.233a.75.75 0 0 0 1.15-.963l-.554.462.554-.463-.002-.001-.002-.003-.006-.007-.017-.02a4.466 4.466 0 0 0-.26-.267 5.66 5.66 0 0 0-.748-.595C14.148 4.447 13.191 4 12 4c-2.176 0-3.463.876-4.182 1.864-.462.635-.659 1.348-.746 2.027-.076.586-.074 1.196-.072 1.736V10h-.25A1.75 1.75 0 0 0 5 11.75v5.5A2.75 2.75 0 0 0 7.75 20h8.5A2.75 2.75 0 0 0 19 17.25v-5.5A1.75 1.75 0 0 0 17.25 10H8.5v-.38c-.001-.55-.002-1.056.06-1.538.069-.535.21-.976.47-1.335ZM12 5.5l2.676 1.233-.004-.005a3.005 3.005 0 0 0-.164-.168 4.16 4.16 0 0 0-.55-.436c-.48-.321-1.15-.624-1.958-.624Zm-5.5 6.25a.25.25 0 0 1 .25-.25h10.5a.25.25 0 0 1 .25.25v5.5c0 .69-.56 1.25-1.25 1.25h-8.5c-.69 0-1.25-.56-1.25-1.25v-5.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLockOpen24;
