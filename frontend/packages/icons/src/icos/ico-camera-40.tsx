import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCamera40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M15.954 6a3.1 3.1 0 0 0-2.861 1.908l-1.29 3.096a.4.4 0 0 1-.37.246h-.583A4.85 4.85 0 0 0 6 16.1v13.125a4.85 4.85 0 0 0 4.85 4.85h18.375a4.85 4.85 0 0 0 4.85-4.85V16.1a4.85 4.85 0 0 0-4.85-4.85h-.583a.4.4 0 0 1-.37-.246l-1.29-3.096A3.1 3.1 0 0 0 24.121 6h-8.167Zm-.37 2.946a.4.4 0 0 1 .37-.246h8.167a.4.4 0 0 1 .37.246l1.29 3.096a3.1 3.1 0 0 0 2.86 1.908h.584a2.15 2.15 0 0 1 2.15 2.15v13.125a2.15 2.15 0 0 1-2.15 2.15H10.85a2.15 2.15 0 0 1-2.15-2.15V16.1a2.15 2.15 0 0 1 2.15-2.15h.583a3.1 3.1 0 0 0 2.862-1.908l1.29-3.096Zm.116 12.842a4.338 4.338 0 1 1 8.675 0 4.338 4.338 0 0 1-8.675 0Zm4.338-7.038a7.038 7.038 0 1 0 0 14.075 7.038 7.038 0 0 0 0-14.075Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCamera40;
