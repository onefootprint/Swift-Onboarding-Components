import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCheckCircle24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-6.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Zm9.4-1.877a.75.75 0 1 0-1.3-.746l-2.294 3.997a.25.25 0 0 1-.443-.018l-.434-.925a.75.75 0 0 0-1.358.638l.434.924c.601 1.282 2.397 1.356 3.102.128l2.293-3.998Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCheckCircle24;
