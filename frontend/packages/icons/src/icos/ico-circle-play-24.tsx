import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCirclePlay24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12.104 3.667a8.439 8.439 0 0 0-8.438 8.437 8.439 8.439 0 0 0 8.438 8.437 8.439 8.439 0 0 0 8.437-8.437 8.44 8.44 0 0 0-8.438-8.437Zm-7.187 8.437a7.189 7.189 0 0 1 7.187-7.187 7.19 7.19 0 0 1 7.187 7.187 7.19 7.19 0 0 1-7.188 7.187 7.189 7.189 0 0 1-7.186-7.187Zm10.229.378-4.657 2.813a.438.438 0 0 1-.664-.379V9.291a.439.439 0 0 1 .664-.379l4.657 2.813a.445.445 0 0 1 0 .757Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCirclePlay24;
