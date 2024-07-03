import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCirclePlay16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8 1.3c-3.7 0-6.7 3-6.7 6.7s3 6.7 6.7 6.7 6.7-3 6.7-6.7-3-6.7-6.7-6.7ZM2.7 8c0-2.926 2.374-5.3 5.3-5.3 2.926 0 5.3 2.374 5.3 5.3 0 2.926-2.374 5.3-5.3 5.3A5.302 5.302 0 0 1 2.7 8Zm7.637.29L6.76 10.452a.336.336 0 0 1-.51-.29V5.84a.337.337 0 0 1 .51-.291l3.577 2.16a.34.34 0 0 1 0 .582Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCirclePlay16;
