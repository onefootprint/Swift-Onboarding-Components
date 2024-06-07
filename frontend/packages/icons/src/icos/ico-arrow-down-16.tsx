import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoArrowDown16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.755 2.64a.75.75 0 0 0-1.5 0v8.86L4.663 8.782a.75.75 0 0 0-1.086 1.036l3.886 4.07a.75.75 0 0 0 1.085 0l3.885-4.07a.75.75 0 1 0-1.085-1.036l-2.593 2.716V2.64Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowDown16;
