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
        d="M12 2.25c-5.383 0-9.75 4.367-9.75 9.75s4.367 9.75 9.75 9.75 9.75-4.367 9.75-9.75S17.383 2.25 12 2.25ZM3.75 12A8.252 8.252 0 0 1 12 3.75 8.252 8.252 0 0 1 20.25 12 8.252 8.252 0 0 1 12 20.25 8.252 8.252 0 0 1 3.75 12Zm11.755.436-5.365 3.24a.506.506 0 0 1-.765-.435V8.76a.505.505 0 0 1 .765-.437l5.365 3.241a.51.51 0 0 1 0 .872Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCirclePlay24;
