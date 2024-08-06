import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFootprintShield24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.784 4.55a.499.499 0 0 1 .432 0l7.006 3.367c.189.09.3.283.274.49-.243 1.9-1.72 11.12-7.496 11.12-5.777 0-7.253-9.22-7.496-11.12a.476.476 0 0 1 .274-.49l7.006-3.368Zm2.876 8.437h-1.215c-.838 0-1.518.68-1.518 1.52v1.215H9.802V8.429h4.858v1.38a1.215 1.215 0 1 0 0 2.103v1.075Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFootprintShield24;
