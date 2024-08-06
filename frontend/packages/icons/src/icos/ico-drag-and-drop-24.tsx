import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDragAndDrop24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.25 6.792a1.458 1.458 0 1 1 2.917 0 1.458 1.458 0 0 1-2.917 0ZM12.834 6.792a1.458 1.458 0 1 1 2.916 0 1.458 1.458 0 0 1-2.916 0ZM8.25 17.208a1.458 1.458 0 1 1 2.917 0 1.458 1.458 0 0 1-2.917 0ZM12.834 17.208a1.458 1.458 0 1 1 2.916 0 1.458 1.458 0 0 1-2.916 0ZM8.25 11.917a1.458 1.458 0 0 1 2.917 0V12a1.458 1.458 0 0 1-2.917 0v-.083ZM12.834 11.917a1.458 1.458 0 1 1 2.916 0V12a1.458 1.458 0 0 1-2.916 0v-.083Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoDragAndDrop24;
