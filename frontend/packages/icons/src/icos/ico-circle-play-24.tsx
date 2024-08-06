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
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.104 3.542a8.564 8.564 0 0 0-8.563 8.562 8.564 8.564 0 0 0 8.563 8.562 8.564 8.564 0 0 0 8.562-8.562 8.564 8.564 0 0 0-8.563-8.562Zm-7.062 8.562a7.064 7.064 0 0 1 7.062-7.062 7.064 7.064 0 0 1 7.062 7.062 7.064 7.064 0 0 1-7.063 7.062 7.064 7.064 0 0 1-7.061-7.062Zm10.104.378-4.657 2.813a.438.438 0 0 1-.664-.379V9.291a.439.439 0 0 1 .664-.379l4.657 2.813a.445.445 0 0 1 0 .757Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCirclePlay24;
