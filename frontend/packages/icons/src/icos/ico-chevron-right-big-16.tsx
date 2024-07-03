import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronRightBig16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.377 2.922a.85.85 0 0 1 1.201-.045l4.85 4.5a.85.85 0 0 1 0 1.246l-4.85 4.5a.85.85 0 1 1-1.156-1.246L9.6 8 5.422 4.123a.85.85 0 0 1-.045-1.201Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronRightBig16;
