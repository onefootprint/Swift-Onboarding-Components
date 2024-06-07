import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoHeart16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        clipRule="evenodd"
        d="M7.995 3.402c-1.4-1.567-3.733-1.989-5.487-.554-1.753 1.435-2 3.835-.623 5.532l6.11 5.659 6.11-5.659c1.377-1.697 1.16-4.112-.623-5.532-1.784-1.42-4.087-1.013-5.487.554Z"
        stroke={theme.color[color]}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoHeart16;
