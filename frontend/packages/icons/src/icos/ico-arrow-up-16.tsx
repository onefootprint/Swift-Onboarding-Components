import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoArrowUp16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.255 13.001a.75.75 0 0 0 1.5 0v-8.49l2.593 2.717a.75.75 0 1 0 1.085-1.035l-3.885-4.07a.75.75 0 0 0-1.085 0l-3.886 4.07a.75.75 0 1 0 1.086 1.035l2.592-2.716v8.49Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowUp16;
