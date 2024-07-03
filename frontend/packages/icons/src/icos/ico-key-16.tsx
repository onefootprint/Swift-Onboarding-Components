import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoKey16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.613 1a4.396 4.396 0 0 0-4.362 4.942l-5.046 5.046a.7.7 0 0 0-.205.495v2.826a.7.7 0 0 0 .7.7h2.826a.7.7 0 0 0 .495-.205l.652-.652a.7.7 0 0 0 .205-.495v-.822H6.7a.7.7 0 0 0 .495-.205l1.087-1.087a.7.7 0 0 0 .205-.495v-.822h.822a.7.7 0 0 0 .495-.205l.263-.263A4.396 4.396 0 1 0 10.613 1ZM7.617 5.396a2.996 2.996 0 1 1 2.358 2.927.7.7 0 0 0-.643.19l-.313.313H7.787a.7.7 0 0 0-.7.7v1.232l-.677.677H5.178a.7.7 0 0 0-.7.7v1.232l-.242.242H2.4v-1.836l5.096-5.097a.7.7 0 0 0 .19-.643 3.008 3.008 0 0 1-.069-.637Zm3.706-.102a.754.754 0 1 0 0-1.507.754.754 0 0 0 0 1.507Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoKey16;
