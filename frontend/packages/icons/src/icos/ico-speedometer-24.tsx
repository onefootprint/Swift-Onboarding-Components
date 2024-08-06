import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSpeedometer24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m10.333 10.333-3.75-3.75M12 6.375V4.292a7.708 7.708 0 1 1-6.952 4.375M14.292 12a2.292 2.292 0 1 1-4.584 0 2.292 2.292 0 0 1 4.583 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoSpeedometer24;
