import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoClockSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M3.3 8a4.7 4.7 0 1 1 9.401 0A4.7 4.7 0 0 1 3.3 8ZM8 2a6 6 0 1 0 0 12.001A6 6 0 0 0 8 2Zm-.65 3.048V8.27l.191.19 1.476 1.476.92-.92L8.65 7.732V5.048h-1.3Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoClockSmall16;
